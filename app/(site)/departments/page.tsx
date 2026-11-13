import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import PageContent from "@/components/PageContent";
import { getSitePage } from "@/lib/content";
import { navItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Departments - University of Nursing, Mandalay",
};

export default async function DepartmentsPage() {
  const doc = await getSitePage("departments");
  const departments =
    navItems.find((item) => item.label === "Departments")?.children ?? [];

  return (
    <>
      <PageBanner
        eyebrow="Academics"
        title={doc?.title ?? "Departments"}
        crumbs={[{ label: "Departments" }]}
      />

      <div className="uon-container py-10">
        {doc?.body ? (
          <article className="uon-card p-6 sm:p-8">
            <PageContent html={doc.body} />
          </article>
        ) : null}

        <h2 className="uon-section-title mt-10 text-lg">All departments</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <li key={department.label}>
              <Link
                href={department.href ?? "#"}
                className="uon-card flex h-full items-center justify-between gap-3 px-5 py-4 text-[13.5px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              >
                {department.label}
                <span aria-hidden="true" className="text-brand">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
