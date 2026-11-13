import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Service-role client. It bypasses Row Level Security completely, so it must
 * only ever be imported from server code (Route Handlers, Server Actions,
 * scripts). Importing this into a Client Component would leak full database
 * access to the browser.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local before using the admin client.",
    );
  }

  return createSupabaseClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
