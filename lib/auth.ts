import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type Session = {
  userId: string;
  email: string | null;
  profile: Profile;
};

/**
 * Resolves the current session, or null when signed out. Always goes through
 * getUser(), which revalidates the token with Supabase Auth rather than
 * trusting the cookie contents.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as Profile | null;
  if (!profile) return null;

  return { userId: user.id, email: user.email ?? null, profile };
}

/** Server-side guard for admin pages and actions. */
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Stricter guard for admin-only areas such as user roles and the audit log. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireStaff();
  if (session.profile.role !== "admin") redirect("/admin?error=forbidden");
  return session;
}
