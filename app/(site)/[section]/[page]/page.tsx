import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import PageContent from "@/components/PageContent";
import { getSitePage } from "@/lib/content";
import { navEntryFor, navHrefs } from "@/lib/data";

type Props = { params: Promise<{ section: string; page: string }> };

/** Every inner page is addressed by the two menu segments, e.g. university/campus. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, page } = await params;
  const href = `/${section}/${page}`;
  const [doc, entry] = await Promise.all([
    getSitePage(`${section}/${page}`),
    Promise.resolve(navEntryFor(href)),
  ]);
  const title = doc?.title ?? entry?.label ?? "Page";

  return { title: `${title} - University of Nursing, Mandalay` };
}

export default async function ContentPage({ params }: Props) {
  const { section, page } = await params;
  const href = `/${section}/${page}`;
  const entry = navEntryFor(href);

  if (!entry || !navHrefs.includes(href)) notFound();

  const doc = await getSitePage(`${section}/${page}`);
  const title = doc?.title ?? entry.label;

  return (
    <>
      <PageBanner
        eyebrow={doc?.section ?? entry.parent?.label ?? undefined}
        title={title}
        crumbs={[
          ...(entry.parent ? [{ label: entry.parent.label, href: entry.parent.href }] : []),
          { label: entry.label },
        ]}
      />

      <div className="uon-container py-10">
        <article className="uon-card p-6 sm:p-8">
          <PageContent html={doc?.body} />
        </article>
      </div>
    </>
  );
}
