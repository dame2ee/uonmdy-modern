import { createClient } from "@/lib/supabase/server";
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
