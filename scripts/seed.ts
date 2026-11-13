/**
 * One-off seed: copies the content that used to be hard-coded in lib/data.ts
 * into Supabase so the public site can read it from the database.
 *
 *   npm run seed
 *
 * Safe to re-run: the content tables are cleared first. Uses the service-role
 * key, so it must never run in the browser.
 */
import {
  announcements,
  campusStats,
  galleryImages,
  latestNews,
  rectors,
  slides,
} from "../lib/data";
import { loadEnvLocal, serviceFetch, slugify } from "./env";

loadEnvLocal();

const STAT_ICONS = ["staff", "office", "student", "postgrad", "graduate"];

/** Empties a content table. `id is not null` is always true, so it deletes all rows. */
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
  console.log(`  ${table.padEnd(16)} ${rows.length} rows`);
}

async function main() {
  console.log("Seeding content from lib/data.ts…\n");

  const now = Date.now();

  for (const table of [
    "slides",
    "announcements",
    "news",
    "rectors",
    "campus_stats",
    "gallery_images",
  ]) {
    await clear(table);
  }

  await insert(
    "slides",
    slides.map((slide, index) => ({
      title: slide.title,
      subtitle: slide.description || null,
      image_url: slide.image,
      sort_order: index,
      published: true,
    })),
  );

  await insert(
    "announcements",
    announcements.map((item, index) => ({
      title: item.title,
      sort_order: index,
      published: true,
      published_at: new Date(now - index * 86_400_000).toISOString(),
    })),
  );

  await insert(
    "news",
    latestNews.map((item, index) => ({
      title: item.title,
      slug: slugify(item.title, `news-${index + 1}`),
      image_url: item.image,
      published: true,
      published_at: new Date(now - index * 604_800_000).toISOString(),
    })),
  );

  await insert(
    "rectors",
    rectors.map((rector, index) => ({
      name: rector.name,
      period: rector.period,
      image_url: rector.image,
      sort_order: index,
      published: true,
    })),
  );

  await insert(
    "campus_stats",
    campusStats.map((stat, index) => ({
      label: stat.label,
      value: stat.value,
      icon: STAT_ICONS[index] ?? null,
      sort_order: index,
    })),
  );

  await insert(
    "gallery_images",
    galleryImages.map((image, index) => ({
      title: `Campus photo ${index + 1}`,
      image_url: image,
      category: "Campus",
      sort_order: index,
      published: true,
    })),
  );

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
