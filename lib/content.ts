import { createClient } from "@/lib/supabase/server";
import { htmlToText } from "@/lib/sanitize-html";
import type {
  Announcement,
  CampusStat,
  GalleryImage,
  NewsItem,
  Rector,
  SitePage,
  Slide,
} from "@/lib/types";

/**
 * Read-only queries for the public site. Every getter filters on `published`:
 * anon clients are already restricted by RLS, but a signed-in staff member
 * would otherwise see unpublished drafts on the public pages.
 *
 * Errors return an empty list so a database hiccup degrades to an empty
 * section rather than a 500.
 */

export async function getSlides(limit = 12): Promise<Slide[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("slides")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[content] slides:", error.message);
    return [];
  }
  return (data ?? []) as Slide[];
}

export async function getAnnouncements(limit = 24): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[content] announcements:", error.message);
    return [];
  }
  return (data ?? []) as Announcement[];
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[content] announcements/id:", error.message);
    return null;
  }
  return (data as Announcement | null) ?? null;
}

export async function getNews(limit = 3): Promise<NewsItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[content] news:", error.message);
    return [];
  }
  return (data ?? []) as NewsItem[];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[content] news/slug:", error.message);
    return null;
  }
  return (data as NewsItem | null) ?? null;
}

export async function getRectors(limit = 12): Promise<Rector[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rectors")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[content] rectors:", error.message);
    return [];
  }
  return (data ?? []) as Rector[];
}

export async function getGalleryImages(limit = 120): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[content] gallery:", error.message);
    return [];
  }
  return (data ?? []) as GalleryImage[];
}

export async function getPages(): Promise<SitePage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("published", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("[content] pages:", error.message);
    return [];
  }
  return (data ?? []) as SitePage[];
}

export async function getSitePage(slug: string): Promise<SitePage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[content] pages/slug:", error.message);
    return null;
  }
  return (data as SitePage | null) ?? null;
}

export async function getCampusStats(): Promise<CampusStat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campus_stats")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[content] campus_stats:", error.message);
    return [];
  }
  return (data ?? []) as CampusStat[];
}

// ---------------------------------------------------------------------------
//  Site search
// ---------------------------------------------------------------------------

export type SearchHit = {
  id: string;
  kind: "Page" | "News" | "Announcement";
  title: string;
  href: string;
  /** Where the page sits in the menu, e.g. "Departments". */
  context: string | null;
  snippet: string | null;
  publishedAt: string | null;
};

type PageRow = {
  id: string;
  slug: string;
  title: string;
  section: string | null;
  body: string | null;
};

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  published_at: string | null;
};

type AnnouncementRow = {
  id: string;
  title: string;
  body: string | null;
  published_at: string | null;
};

/** Shortest term worth querying for, also used by the results page. */
export const MIN_SEARCH_LENGTH = 2;

/**
 * `%` and `_` are wildcards and `,()` break the PostgREST `or` grammar, so a
 * typed term is escaped before it is used as a filter.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&").replace(/[,()"'*]/g, " ").trim();
}

function buildSnippet(html: string | null, term: string, length = 200): string | null {
  const text = htmlToText(html);
  if (!text) return null;

  const index = text.toLowerCase().indexOf(term.toLowerCase());

  if (index === -1) {
    return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
  }

  const start = Math.max(0, index - 70);
  const end = Math.min(text.length, index + term.length + 130);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

/** Searches published pages, news and announcements. */
export async function searchContent(query: string, limit = 25): Promise<SearchHit[]> {
  const term = query.trim().slice(0, 80);
  if (term.length < MIN_SEARCH_LENGTH) return [];

  const pattern = `%${escapeLike(term)}%`;
  const supabase = await createClient();

  const [pages, news, announcements] = await Promise.all([
    supabase
      .from("pages")
      .select("id, slug, title, section, body")
      .eq("published", true)
      .or(`title.ilike.${pattern},body.ilike.${pattern}`)
      .order("title", { ascending: true })
      .limit(limit),
    supabase
      .from("news")
      .select("id, slug, title, excerpt, body, published_at")
      .eq("published", true)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern},body.ilike.${pattern}`)
      .order("published_at", { ascending: false })
      .limit(limit),
    supabase
      .from("announcements")
      .select("id, title, body, published_at")
      .eq("published", true)
      .or(`title.ilike.${pattern},body.ilike.${pattern}`)
      .order("published_at", { ascending: false })
      .limit(limit),
  ]);

  for (const [label, result] of [
    ["pages", pages],
    ["news", news],
    ["announcements", announcements],
  ] as const) {
    if (result.error) console.error(`[content] search ${label}:`, result.error.message);
  }

  const hits: SearchHit[] = [
    ...((pages.data ?? []) as PageRow[]).map((row) => ({
      id: row.id,
      kind: "Page" as const,
      title: row.title,
      href: `/${row.slug}`,
      context: row.section,
      snippet: buildSnippet(row.body, term),
      publishedAt: null,
    })),
    ...((news.data ?? []) as NewsRow[]).map((row) => ({
      id: row.id,
      kind: "News" as const,
      title: row.title,
      href: `/activities/news/${row.slug}`,
      context: "News",
      snippet: buildSnippet(row.excerpt ?? row.body, term),
      publishedAt: row.published_at,
    })),
    ...((announcements.data ?? []) as AnnouncementRow[]).map((row) => ({
      id: row.id,
      kind: "Announcement" as const,
      title: row.title,
      href: `/activities/announcement/${row.id}`,
      context: "Announcement",
      snippet: buildSnippet(row.body, term),
      publishedAt: row.published_at,
    })),
  ];

  const lower = term.toLowerCase();
  return hits.sort((a, b) => {
    const score = (hit: SearchHit) => (hit.title.toLowerCase().includes(lower) ? 0 : 1);
    return score(a) - score(b) || a.title.localeCompare(b.title);
  });
}
