import { z } from "zod";

/**
 * Environment contract. Parsed at module load so a misconfigured deployment
 * fails immediately instead of on the first request.
 *
 * Only `NEXT_PUBLIC_*` values live here — they are inlined into the client
 * bundle by Next.js. Server-only secrets are read inside the server modules
 * that need them.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
