import type { Context } from "@netlify/functions";

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

type AssignmentPayload = {
  name: string;
  course: string;
  dueDate: string;
  completed: boolean;
};

const PROPERTY_NAMES = {
  name: ["Assignment's"],
  course: ["Class"],
  dueDate: ["Due Date"],
  completed: ["🏝️"]
};

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

async function retrievePage(token: string, pageId: string) {
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2026-03-11"
    }
  });

  if (!response.ok) {
    return "";
  }

  const page = await response.json();
  return getPageTitle(page);
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
    completed: getPropertyCheckbox(page, PROPERTY_NAMES.completed)
  };
}

async function queryAllPages(token: string, databaseId: string) {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2026-03-11"
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor
      })
    });

    if (!response.ok) {
      throw new Error(`Notion API returned ${response.status}`);
    }

    const data = await response.json();
    pages.push(...(data.results ?? []));
    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);

  return pages;
}

export default async (_req: Request, _context: Context) => {
  const token = Netlify.env.get("NOTION_TOKEN");
  const databaseId = Netlify.env.get("NOTION_ASSIGNMENTS_DATABASE_ID");

  if (!token || !databaseId) {
    return Response.json({
      source: "fallback",
      assignments: []
    });
  }

  try {
    const pages = await queryAllPages(token, databaseId);
    const relationTitleCache = new Map<string, string>();
    const assignments = (await Promise.all(pages.map((page) => buildAssignment(page, token, relationTitleCache))))
      .filter((assignment) => assignment.dueDate && !assignment.completed);

    return Response.json({
      source: "notion",
      assignments
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      source: "fallback",
      assignments: []
    });
  }
};
