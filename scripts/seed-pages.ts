/**
 * Seeds the `pages` table with the real body content of the University,
 * Faculty, Study and Department sections, copied from the original
 * uonmdy.edu.mm site. It also fills in the news and announcement bodies.
 *
 *   npm run seed:pages
 *
 * The `pages` table is cleared first, so this script is safe to re-run. News
 * and announcement rows are patched in place (matched by their seed order), so
 * nothing there is deleted. Uses the service-role key: never run this from the
 * browser.
 */
import { navEntryFor } from "../lib/data";
import { loadEnvLocal, serviceFetch } from "./env";

loadEnvLocal();

const ORIGIN = "https://www.uonmdy.edu.mm";
const BASE = `${ORIGIN}/uonmdy`;
const UA = { "User-Agent": "Mozilla/5.0" };

const CONTENT_PATHS = [
  "university/aim-and-objectives",
  "university/history-of-university",
  "university/vision-and-mission",
  "university/organogram",
  "university/campus",
  "university/library",
  "university/foreward-by-rector",
  "faculty/administrative",
  "faculty/academic",
  "study/courses",
  "study/teaching-hospitals",
  "study/research",
  "study/statistics",
  "departments",
  "departments/myanmar",
  "departments/english",
  "departments/physics",
  "departments/chemistry",
  "departments/humanbiology",
  "departments/pathology",
  "departments/microbiology",
  "departments/pharmacology",
  "departments/biochemistry",
  "departments/fundamental-nursing",
  "departments/communityhealthnursing",
  "departments/maternal-childhealthnursing",
  "departments/adulthealthnursing",
  "departments/mentalhealthnursing",
  "activities/seminars-workshops",
];

/** Titles the origin page itself gets wrong (or words differently from the menu). */
const TITLE_OVERRIDES: Record<string, string> = {
  "departments/mentalhealthnursing": "Department of Mental Health Nursing",
  "faculty/administrative": "Administrative",
};

/** Attributes that only add fixed sizes or Word/joomla cruft once rendered here. */
const DROP_ATTRS = [
  "style",
  "class",
  "id",
  "align",
  "width",
  "height",
  "border",
  "cellspacing",
  "cellpadding",
  "itemprop",
  "itemscope",
  "itemtype",
  "frameborder",
  "target",
  "rel",
  "title",
];

const decoder: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function decode(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;|&#39;/gi, (entity) => decoder[entity] ?? entity);
}

/** The origin server rate-limits bursts, so requests are paced and retried. */
const REQUEST_GAP_MS = 900;
const MAX_ATTEMPTS = 4;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(path: string, attempt = 1): Promise<string | null> {
  const url = path ? `${BASE}${path.startsWith("/") ? path : `/${path}`}` : BASE;

  try {
    const response = await fetch(url, { headers: UA });

    if (response.ok) {
      const html = await response.text();
      await sleep(REQUEST_GAP_MS);
      return html;
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 2_500);
      return fetchPage(path, attempt + 1);
    }

    console.warn(`    ! ${path} → ${response.status}`);
    await sleep(REQUEST_GAP_MS);
    return null;
  } catch (error) {
    if (attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 2_500);
      return fetchPage(path, attempt + 1);
    }
    console.warn(`    ! ${path} → ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

function extractTitle(html: string) {
  const match = /<h[12][^>]*class="article-title"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i.exec(html);
  if (!match) return "";
  return decode(match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
}

function extractArticle(html: string) {
  const match = /<section[^>]*class="article-(?:content|intro)[^"]*"[^>]*>([\s\S]*?)<\/section>/i.exec(html);
  return match ? match[1] : "";
}

/** The "Teaching Faculties (…)" block that sits in the sidebar of department pages. */
function extractFacultyBlock(html: string) {
  const match =
    /<h3[^>]*class="module-title[^"]*"[^>]*>[\s\S]*?Teaching Facult[\s\S]*?<\/h3>[\s\S]*?<div[^>]*class="module-ct"[^>]*>([\s\S]*?)<\/div>/i.exec(
      html,
    );
  return match ? match[1] : "";
}

function plainText(html: string) {
  return decode(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a fragment carries something worth publishing (several pages are image only). */
function hasContent(html: string) {
  return plainText(html).length >= 40 || /<(?:img|iframe|table)\b/i.test(html);
}

function sanitize(html: string) {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\son[a-z]+="[^"]*"/gi, "");

  for (const attr of DROP_ATTRS) {
    out = out
      .replace(new RegExp(`\\s${attr}="[^"]*"`, "gi"), "")
      .replace(new RegExp(`\\s${attr}='[^']*'`, "gi"), "");
  }

  // Absolute links so images and external links resolve, then bring the
  // in-site pages back under our own routes.
  out = out.replace(/href="\//g, `href="${ORIGIN}/`).replace(/src="\//g, `src="${ORIGIN}/`);

  for (const path of [...CONTENT_PATHS].sort((a, b) => b.length - a.length)) {
    out = out.split(`href="${ORIGIN}/${path}"`).join(`href="/${path}"`);
  }

  return out.replace(/\s{2,}/g, " ").trim();
}

function buildBody(html: string) {
  const parts: string[] = [];
  const article = sanitize(extractArticle(html));
  if (article) parts.push(article);

  const faculty = extractFacultyBlock(html);
  if (faculty) {
    const facultyHtml = sanitize(faculty);
    const probe = plainText(facultyHtml).slice(0, 80);
    if (probe && !plainText(article).includes(probe)) {
      parts.push(`<h2>Teaching Faculties</h2>${facultyHtml}`);
    }
  }

  return parts.filter(Boolean).join("\n");
}

async function clear(table: string) {
  await serviceFetch(`/rest/v1/${table}?id=not.is.null`, { method: "DELETE" });
}

async function insert(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  await serviceFetch(`/rest/v1/${table}`, {
    method: "POST",
    prefer: "return=minimal",
    body: JSON.stringify(rows),
  });
}

async function seedPages() {
  await clear("pages");

  const rows: Record<string, unknown>[] = [];
  const skipped: string[] = [];

  for (const path of CONTENT_PATHS) {
    const href = `/${path}`;
    const label = navEntryFor(href)?.label ?? path;
    const html = await fetchPage(path);

    if (!html) {
      skipped.push(`${path} (not reachable)`);
      continue;
    }

    const body = buildBody(html);
    if (!hasContent(body)) {
      skipped.push(`${path} (no content yet)`);
      continue;
    }

    rows.push({
      slug: path,
      title: TITLE_OVERRIDES[path] ?? (extractTitle(html) || label),
      section: path.split("/")[0].replace(/^\w/, (c) => c.toUpperCase()),
      body,
      published: true,
    });
    console.log(`  ${path.padEnd(46)} ${plainText(body).length} chars`);
  }

  await insert("pages", rows);
  console.log(`\n  pages: ${rows.length} rows`);

  if (skipped.length > 0) {
    console.log("\n  Skipped (page keeps its placeholder state):");
    for (const item of skipped) console.log(`    - ${item}`);
  }
}

function listHrefs(html: string, section: "news" | "announcement") {
  const pattern = new RegExp(`href="(/uonmdy/activities/${section}/[^"?#]+)"`, "gi");
  const seen: string[] = [];
  for (const match of html.matchAll(pattern)) {
    if (!seen.includes(match[1])) seen.push(match[1]);
  }
  return seen;
}

async function enrichActivities() {
  const home = await fetchPage("");
  if (!home) {
    console.log("\n  ! home page unreachable — skipped news/announcement bodies");
    return;
  }

  const jobs = [
    { section: "announcement" as const, table: "announcements", order: "sort_order.asc", images: false },
    { section: "news" as const, table: "news", order: "published_at.desc", images: true },
  ];

  for (const job of jobs) {
    const hrefs = listHrefs(home, job.section);
    const rows =
      (await serviceFetch<{ id: string }[]>(
        `/rest/v1/${job.table}?select=id&order=${job.order}`,
      )) ?? [];

    const total = Math.min(hrefs.length, rows.length);
    let updated = 0;

    for (let index = 0; index < total; index += 1) {
      const detail = await fetchPage(hrefs[index].replace(/^\/uonmdy/, ""));
      if (!detail) continue;

      const body = sanitize(extractArticle(detail));
      if (!hasContent(body)) continue;

      const patch: Record<string, unknown> = { body };
      if (job.images) {
        const image = /<img[^>]*src="([^"]+)"/i.exec(body)?.[1];
        if (image) patch.image_url = image;
      }

      await serviceFetch(`/rest/v1/${job.table}?id=eq.${rows[index].id}`, {
        method: "PATCH",
        prefer: "return=minimal",
        body: JSON.stringify(patch),
      });
      updated += 1;
    }

    console.log(`  ${job.table.padEnd(16)} ${updated} of ${hrefs.length} bodies attached`);
  }
}

async function main() {
  console.log("Copying page content from uonmdy.edu.mm…\n");
  await seedPages();
  console.log("\nAttaching news and announcement detail content…\n");
  await enrichActivities();
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
