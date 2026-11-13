/**
 * Runs once when the Next.js server boots.
 *
 * `@supabase/supabase-js` builds a Realtime client eagerly in its constructor,
 * and Realtime requires a global `WebSocket`. Node 22+ ships one; on Node 20 we
 * install `ws` as a polyfill so server-side Supabase calls work. This project
 * never opens a Realtime connection, so only the constructor check matters.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (typeof globalThis.WebSocket !== "undefined") return;

  const { WebSocket } = await import("ws");
  (globalThis as { WebSocket?: unknown }).WebSocket = WebSocket;
}
