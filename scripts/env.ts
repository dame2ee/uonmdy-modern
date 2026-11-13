/**
 * Shared helpers for the one-off scripts. Kept dependency-free (Node's built-in
 * fetch only) so they can run on any Node 18+ install — note that
 * @supabase/supabase-js cannot be used here, because it initialises a Realtime
 * client that requires native WebSocket support (Node 22+).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnvLocal() {
  let text: string;
  try {
    text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  } catch {
    throw new Error("Could not read .env.local — run this from the project root.");
  }

  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("#")) continue;
    const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

export function requireServiceEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  return { url, key };
}

/** Calls Supabase with the service-role key and throws on any non-2xx reply. */
export async function serviceFetch<T = unknown>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T | null> {
  const { url, key } = requireServiceEnv();
  const { prefer, ...rest } = init;

  const response = await fetch(`${url}${path}`, {
    ...rest,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(rest.headers ?? {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `${rest.method ?? "GET"} ${path} → ${response.status} ${text.slice(0, 300)}`,
    );
  }

  return text ? (JSON.parse(text) as T) : null;
}

/** URL-safe slug for seed data; ascii only, so Burmese titles fall back to an id. */
export function slugify(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || fallback;
}
