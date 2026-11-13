import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import type { AppRole } from "@/lib/types";

const STAFF_ROLES: AppRole[] = ["admin", "editor"];

function loginRedirect(request: NextRequest, next: string, error?: string) {
  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", next);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

/**
 * Refreshes the Supabase auth session on every request and guards the admin
 * area. Runs in the edge runtime, so the role lookup goes through the anon
 * client and is therefore still subject to Row Level Security.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates the token against Supabase Auth. getSession() would
  // trust whatever is in the cookie without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  // Only resolved when signed in. RLS lets a user read their own profile row.
  let role: AppRole | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile as { role?: AppRole } | null)?.role;
  }

  const isStaff = Boolean(role && STAFF_ROLES.includes(role));

  if (isAdminArea && !isLoginRoute && !isStaff) {
    // Signed in without staff rights still lands here, so it shows the notice
    // instead of bouncing back to /admin forever.
    return loginRedirect(request, pathname, user ? "forbidden" : undefined);
  }

  if (isLoginRoute && isStaff) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}
