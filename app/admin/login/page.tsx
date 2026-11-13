import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

/** Only relative, single-slash paths are honoured, so `next` cannot leave the site. */
function safeNext(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/admin";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const forbidden = params.error === "forbidden";

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <span className="uon-eyebrow text-gold">Staff area</span>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin centre</h1>
          <p className="mt-1.5 text-sm text-white/60">
            University of Nursing, Mandalay
          </p>
        </div>

        <div className="uon-card p-7">
          {forbidden ? (
            <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              That account does not have staff access.
            </p>
          ) : null}

          <LoginForm next={safeNext(params.next)} />
        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          <Link href="/" className="text-white/70 hover:text-white">
            ← Back to the public site
          </Link>
        </p>
      </div>
    </div>
  );
}
