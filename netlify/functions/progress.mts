import type { Context } from "@netlify/functions";

type NotionText = {
  plain_text?: string;
};

type NotionProperty = {
  formula?: {
    number?: number | null;
    string?: string | null;
  } | null;
  number?: number | null;
  rich_text?: NotionText[];
  rollup?: {
    number?: number | null;
    array?: NotionProperty[];
  } | null;
  select?: { name?: string | null } | null;
  status?: { name?: string | null } | null;
  title?: NotionText[];
};

type NotionPage = {
  properties?: Record<string, NotionProperty>;
};

type ProgressPayload = {
  label: string;
  program: string;
  completedCredits: number;
  totalCredits: number;
  remainingCredits: number;
  percent: number;
};

const DONE_STATUSES = new Set(["Done", "Transfer Credit"]);
const FALLBACK_COMPLETED_CREDITS = 31;
const FALLBACK_TOTAL_CREDITS = 60;
const LABEL = "AA Progress";
const PROGRAM = "Business Administration";

function getConfiguredTotalCredits() {
  const configuredTotal = Number(Netlify.env.get("AA_PROGRESS_TOTAL_CREDITS") ?? FALLBACK_TOTAL_CREDITS);
  return Number.isFinite(configuredTotal) && configuredTotal > 0 ? configuredTotal : FALLBACK_TOTAL_CREDITS;
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

  if (property.status?.name) {
    return property.status.name;
  }

  if (typeof property.formula?.string === "string") {
    return property.formula.string;
  }

  return "";
}

function getPageTitle(page: NotionPage) {
  const properties = Object.values(page.properties ?? {});
  const titleProperty = properties.find((property) => Array.isArray(property.title));
  return getTextValue(titleProperty);
}

function getPropertyText(page: NotionPage, names: string[]) {
  for (const name of names) {
    const value = getTextValue(page.properties?.[name]);

    if (value) {
      return value;
    }
  }

  return "";
}

function getNumberValue(property?: NotionProperty): number | null {
  if (!property) {
    return null;
  }

  if (typeof property.number === "number") {
    return property.number;
  }

  if (typeof property.formula?.number === "number") {
    return property.formula.number;
  }

  if (typeof property.rollup?.number === "number") {
    return property.rollup.number;
  }

  if (Array.isArray(property.rollup?.array)) {
    const total = property.rollup.array.reduce((sum, item) => {
      return sum + (getNumberValue(item) ?? 0);
    }, 0);
    return Number.isFinite(total) ? total : null;
  }

  return null;
}

function getPropertyNumber(page: NotionPage, names: string[]) {
  for (const name of names) {
    const value = getNumberValue(page.properties?.[name]);

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function findProgressPage(pages: NotionPage[]) {
  return pages.find((page) => {
    const title = getPageTitle(page);
    const label = getPropertyText(page, ["Label", "Name", "Class", "Title"]);
    return title === LABEL || label === LABEL;
  });
}

function getCredits(page: NotionPage) {
  return getPropertyNumber(page, ["Credits"]) ?? 0;
}

function getStatus(page: NotionPage) {
  return getPropertyText(page, ["Status", "Progress"]);
}

function normalizePercent(percent: number | null, completedCredits: number, totalCredits: number) {
  const calculated = totalCredits > 0 ? (completedCredits / totalCredits) * 100 : 0;
  const rawPercent = percent ?? calculated;
  const scaledPercent = rawPercent > 0 && rawPercent <= 1 ? rawPercent * 100 : rawPercent;
  return Math.max(0, Math.min(100, Math.round(scaledPercent)));
}

function buildPayload(options: {
  label?: string;
  program?: string;
  completedCredits: number;
  totalCredits: number;
  percent?: number | null;
}): ProgressPayload {
  const safeCompleted = Math.max(0, Math.round(options.completedCredits));
  const safeTotal = Math.max(1, Math.round(options.totalCredits));
  const remainingCredits = Math.max(0, safeTotal - safeCompleted);
  const percent = normalizePercent(options.percent ?? null, safeCompleted, safeTotal);

  return {
    label: options.label || LABEL,
    program: options.program || PROGRAM,
    completedCredits: safeCompleted,
    totalCredits: safeTotal,
    remainingCredits,
    percent
  };
}

async function queryAllPages(token: string, dataSourceId: string) {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
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
  const dataSourceId = Netlify.env.get("NOTION_DATA_SOURCE_ID");
  const configuredTotalCredits = getConfiguredTotalCredits();

  if (!token || !dataSourceId) {
    return Response.json(buildPayload({
      completedCredits: FALLBACK_COMPLETED_CREDITS,
      totalCredits: configuredTotalCredits
    }));
  }

  try {
    const pages = await queryAllPages(token, dataSourceId);
    const progressPage = findProgressPage(pages);

    if (progressPage) {
      const completedCredits = getPropertyNumber(progressPage, ["Completed Credits", "Completed", "Credits Completed"]) ?? FALLBACK_COMPLETED_CREDITS;
      const totalCredits = getPropertyNumber(progressPage, ["Total Credits", "Total", "Credits Total"]) ?? configuredTotalCredits;
      const percent = getPropertyNumber(progressPage, ["Degree Progress", "Percent", "Progress Percent"]);

      return Response.json(buildPayload({
        label: getPropertyText(progressPage, ["Label", "Name", "Class", "Title"]) || LABEL,
        program: getPropertyText(progressPage, ["Program", "Degree", "Major"]) || PROGRAM,
        completedCredits,
        totalCredits,
        percent
      }));
    }

    const completedFromCourses = pages.reduce((sum, page) => {
      return DONE_STATUSES.has(getStatus(page)) ? sum + getCredits(page) : sum;
    }, 0);

    return Response.json(buildPayload({
      completedCredits: completedFromCourses,
      totalCredits: configuredTotalCredits
    }));
  } catch (error) {
    console.error(error);
    return Response.json(buildPayload({
      completedCredits: FALLBACK_COMPLETED_CREDITS,
      totalCredits: configuredTotalCredits
    }));
  }
};
