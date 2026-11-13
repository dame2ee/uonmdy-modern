import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

/**
 * Server client for Server Components, Server Actions and Route Handlers.
 * Reads and writes the auth session through httpOnly cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components are not allowed to set cookies. The middleware
            // refreshes the session on every request, so this is safe to ignore.
          }
        },
      },
    },
  );
}
