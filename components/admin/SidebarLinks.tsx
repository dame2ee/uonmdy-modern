"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarItem = {
  href: string;
  label: string;
  /** Only highlight when the path matches exactly (used for the dashboard). */
  exact?: boolean;
};

export default function SidebarLinks({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3.5 py-2 text-sm transition ${
              active
                ? "bg-white/10 font-semibold text-white shadow-[inset_3px_0_0_0_var(--color-gold)]"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
