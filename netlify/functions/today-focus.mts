import type { Context } from "@netlify/functions";

declare const process: {
  env: Record<string, string | undefined>;
};

type NotionText = {
  plain_text?: string;
};

type NotionDate = {
  start?: string | null;
  end?: string | null;
};

type NotionProperty = {
  checkbox?: boolean | null;
  date?: NotionDate | null;
  formula?: {
    boolean?: boolean | null;
    date?: NotionDate | null;
    number?: number | null;
    string?: string | null;
  } | null;
  multi_select?: Array<{ name?: string | null }>;
  number?: number | null;
  relation?: Array<{ id?: string | null }>;
  rich_text?: NotionText[];
  rollup?: {
    number?: number | null;
    array?: NotionProperty[];
  } | null;
  select?: { name?: string | null } | null;
  title?: NotionText[];
};

type NotionPage = {
  id?: string;
  properties?: Record<string, NotionProperty>;
};

type NotionQueryResponse = {
  results?: NotionPage[];
  has_more?: boolean;
  next_cursor?: string | null;
};

type NotionDatabaseResponse = {
  data_sources?: Array<{
    id?: string | null;
    data_source_id?: string | null;
  }>;
};

type AssignmentPayload = {
  name: string;
  course: string;
  dueDate: string;
  type: string;
  priority: string;
  effort: string;
  completed: boolean;
};

const PROPERTY_NAMES = {
  name: ["Assignment's"],
  course: ["Class"],
  dueDate: ["Due Date"],
  type: ["Type"],
  priority: ["Priority"],
  effort: ["Effort"],
  completed: ["🏝️"]
};

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";
const LEGACY_NOTION_VERSION = "2022-06-28";

class NotionRequestError extends Error {
  status: number;

  constructor(status: number) {
    super(`notion_http_${status}`);
    this.name = "NotionRequestError";
    this.status = status;
  }
}

function getTextValue(property?: NotionProperty) {
  if (!property) {
    return "";
  }

  if (Array.isArray(property.title)) {
    return property.title.map((part) => part.plain_text ?? "").join("").trim();
  }

  if (Array.isArray(property.rich_text)) {
    return property.rich_text.map((part) => part.plain_text ?? "").join("").trim();
  }

  if (property.select?.name) {
    return property.select.name;
  }

  if (Array.isArray(property.multi_select)) {
    return property.multi_select.map((item) => item.name ?? "").filter(Boolean).join(", ");
  }

  if (typeof property.formula?.string === "string") {
    return property.formula.string;
  }

  if (typeof property.formula?.boolean === "boolean") {
    return property.formula.boolean ? "true" : "false";
  }

  if (property.formula?.date?.start) {
    return property.formula.date.start;
  }

  if (typeof property.number === "number") {
    return String(property.number);
  }

  if (typeof property.formula?.number === "number") {
    return String(property.formula.number);
  }

  if (typeof property.rollup?.number === "number") {
    return String(property.rollup.number);
  }

  return "";
}

function getDateValue(property?: NotionProperty) {
  return property?.date?.start ?? "";
}

function getCheckboxValue(property?: NotionProperty) {
  return property?.checkbox === true;
}

function getProperty(page: NotionPage, names: string[]) {
  for (const name of names) {
    const property = page.properties?.[name];

    if (property) {
      return property;
    }
  }

  return undefined;
}

function getPropertyText(page: NotionPage, names: string[]) {
  return getTextValue(getProperty(page, names));
}

function getPropertyDate(page: NotionPage, names: string[]) {
  return getDateValue(getProperty(page, names));
}

function getPropertyCheckbox(page: NotionPage, names: string[]) {
  return getCheckboxValue(getProperty(page, names));
}

function getRelationIds(page: NotionPage, names: string[]) {
  const property = getProperty(page, names);

  if (!Array.isArray(property?.relation)) {
    return [];
  }

  return property.relation.map((relation) => relation.id).filter((id): id is string => Boolean(id));
}

function getPageTitle(page: NotionPage) {
  const titleProperty = Object.values(page.properties ?? {}).find((property) => Array.isArray(property.title));
  return getTextValue(titleProperty);
}

async function requestNotionJson<T>(
  token: string,
  path: string,
  init: RequestInit = {},
  notionVersion = NOTION_VERSION
) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  headers.set("Notion-Version", notionVersion);

  const response = await fetch(`${NOTION_API_BASE}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw new NotionRequestError(response.status);
  }

  return (await response.json()) as T;
}

async function retrievePage(token: string, pageId: string) {
  try {
    const page = await requestNotionJson<NotionPage>(token, `/pages/${pageId}`);
    return getPageTitle(page);
  } catch {
    return "";
  }
}

async function getRelationTitle(token: string, pageId: string, cache: Map<string, string>) {
  if (cache.has(pageId)) {
    return cache.get(pageId) ?? "";
  }

  const title = await retrievePage(token, pageId);
  cache.set(pageId, title);
  return title;
}

async function buildAssignment(page: NotionPage, token: string, relationTitleCache: Map<string, string>): Promise<AssignmentPayload> {
  const relationIds = getRelationIds(page, PROPERTY_NAMES.course);
  const courseTitles = await Promise.all(relationIds.map((id) => getRelationTitle(token, id, relationTitleCache)));

  return {
    name: getPropertyText(page, PROPERTY_NAMES.name) || "Untitled assignment",
    course: courseTitles.filter(Boolean).join(", "),
    dueDate: getPropertyDate(page, PROPERTY_NAMES.dueDate),
    type: getPropertyText(page, PROPERTY_NAMES.type),
    priority: getPropertyText(page, PROPERTY_NAMES.priority),
    effort: getPropertyText(page, PROPERTY_NAMES.effort),
    completed: getPropertyCheckbox(page, PROPERTY_NAMES.completed)
  };
}

async function queryPages(token: string, path: string, notionVersion = NOTION_VERSION) {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const data = await requestNotionJson<NotionQueryResponse>(
      token,
      path,
      {
        method: "POST",
        body: JSON.stringify({
          page_size: 100,
          start_cursor: startCursor
        })
      },
      notionVersion
    );

    pages.push(...(data.results ?? []));
    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);

  return pages;
}

async function queryDataSourcePages(token: string, dataSourceId: string) {
  return queryPages(token, `/data_sources/${dataSourceId}/query`);
}

async function queryLegacyDatabasePages(token: string, databaseId: string) {
  return queryPages(token, `/databases/${databaseId}/query`, LEGACY_NOTION_VERSION);
}

async function getFirstDataSourceId(token: string, databaseId: string) {
  const database = await requestNotionJson<NotionDatabaseResponse>(token, `/databases/${databaseId}`);
  const firstDataSource = database.data_sources?.find((source) => source.id || source.data_source_id);
  return firstDataSource?.id || firstDataSource?.data_source_id || "";
}

async function queryConfiguredAssignmentsSource(token: string, configuredId: string) {
  try {
    return await queryDataSourcePages(token, configuredId);
  } catch (error) {
    const canTryDatabaseLookup = error instanceof NotionRequestError && [400, 404].includes(error.status);

    if (!canTryDatabaseLookup) {
      throw error;
    }

    let dataSourceId = "";

    try {
      dataSourceId = await getFirstDataSourceId(token, configuredId);
    } catch (lookupError) {
      const canTryLegacyQuery = lookupError instanceof NotionRequestError && [400, 404].includes(lookupError.status);

      if (!canTryLegacyQuery) {
        throw lookupError;
      }
    }

    if (dataSourceId) {
      return queryDataSourcePages(token, dataSourceId);
    }

    return queryLegacyDatabasePages(token, configuredId);
  }
}

function mockResponse(reason: "missing_env" | "notion_query_failed") {
  return Response.json({
    source: "mock",
    reason,
    assignments: []
  });
}

export default async (_req: Request, _context: Context) => {
  const token = process.env.NOTION_TOKEN?.trim();
  const databaseId = process.env.NOTION_ASSIGNMENTS_DATABASE_ID?.trim();

  if (!token || !databaseId) {
    return mockResponse("missing_env");
  }

  try {
    const pages = await queryConfiguredAssignmentsSource(token, databaseId);
    const relationTitleCache = new Map<string, string>();
    const assignments = (await Promise.all(pages.map((page) => buildAssignment(page, token, relationTitleCache))))
      .filter((assignment) => assignment.dueDate && !assignment.completed);

    return Response.json({
      source: "notion",
      assignments
    });
  } catch (error) {
    console.error("Today Focus Notion query failed; returning mock source.");

    return mockResponse("notion_query_failed");
  }
};
