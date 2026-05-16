import type { Config, Context } from "@netlify/functions";

type NotionProperty = {
  number?: number | null;
  select?: { name?: string | null } | null;
  title?: Array<{ plain_text?: string }>;
};

type NotionPage = {
  properties?: Record<string, NotionProperty>;
};

const DONE_STATUSES = new Set(["Done", "Transfer Credit"]);

function getTitle(page: NotionPage) {
  const title = page.properties?.Class?.title ?? [];
  return title.map((part) => part.plain_text ?? "").join("");
}

function getCredits(page: NotionPage) {
  return page.properties?.Credits?.number ?? 0;
}

function getStatus(page: NotionPage) {
  return page.properties?.Status?.select?.name ?? "";
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
        start_cursor: startCursor,
        filter_properties: ["Class", "Credits", "Status"]
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
  const totalCredits = Number(Netlify.env.get("AA_PROGRESS_TOTAL_CREDITS") ?? "60");

  if (!token) {
    return Response.json({ error: "Missing NOTION_TOKEN environment variable" }, { status: 500 });
  }

  if (!dataSourceId) {
    return Response.json({ error: "Missing NOTION_DATA_SOURCE_ID environment variable" }, { status: 500 });
  }

  try {
    const pages = await queryAllPages(token, dataSourceId);
    const coursePages = pages.filter((page) => getTitle(page) !== "AA Progress");
    const earnedCredits = coursePages.reduce((sum, page) => {
      return DONE_STATUSES.has(getStatus(page)) ? sum + getCredits(page) : sum;
    }, 0);

    return Response.json({
      earnedCredits,
      totalCredits,
      percent: totalCredits > 0 ? (earnedCredits / totalCredits) * 100 : 0
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load progress";
    return Response.json({ error: message }, { status: 502 });
  }
};

export const config: Config = {
  path: "/api/progress"
};
