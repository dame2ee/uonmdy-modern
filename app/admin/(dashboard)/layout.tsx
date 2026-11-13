import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import SidebarLinks, { type SidebarItem } from "@/components/admin/SidebarLinks";
import { resources } from "@/lib/admin/resources";
import { requireStaff } from "@/lib/auth";

export const metadata = {
  title: { default: "Admin centre", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();

  const items: SidebarItem[] = [
    { href: "/admin", label: "Dashboard", exact: true },
    ...resources.map((resource) => ({
      href: `/admin/${resource.key}`,
      label: resource.label,
    })),
    { href: "/admin/messages", label: "Messages" },
    ...(session.profile.role === "admin"
      ? [{ href: "/admin/audit", label: "Audit log" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-mist lg:flex">
      <aside className="bg-navy px-5 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <Link href="/admin" className="block">
          <span className="uon-eyebrow text-gold">Admin centre</span>
          <span className="mt-1 block text-sm font-semibold text-white">
            University of Nursing
          </span>
        </Link>

        <div className="mt-7">
          <SidebarLinks items={items} />
        </div>

        <div className="mt-8 border-t border-white/10 pt-5">
          <p className="truncate text-xs text-white/60">{session.email}</p>
          <p className="mt-1 inline-flex rounded-full bg-gold/20 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-gold">
            {session.profile.role}
          </p>

          <form action={logoutAction} className="mt-4">
            <button
              type="submit"
              className="w-full rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </form>

          <Link
            href="/"
            className="mt-3 block text-xs text-white/50 transition hover:text-white"
          >
            View public site →
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
