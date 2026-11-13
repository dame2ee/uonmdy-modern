import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import PageContent from "@/components/PageContent";
import { getSitePage } from "@/lib/content";
import { navEntryFor } from "@/lib/data";

type Props = { params: Promise<{ section: string; page: string }> };

/** Every inner page is addressed by the two menu segments, e.g. university/campus. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, page } = await params;
  const href = `/${section}/${page}`;
  const [doc, entry] = await Promise.all([
    getSitePage(`${section}/${page}`),
    Promise.resolve(navEntryFor(href)),
  ]);

  if (!doc && !entry) notFound();

  const title = doc?.title ?? entry?.label ?? "Page";
  return { title: `${title} - University of Nursing, Mandalay` };
}

export default async function ContentPage({ params }: Props) {
  const { section, page } = await params;
  const href = `/${section}/${page}`;
  const [entry, doc] = await Promise.all([
    Promise.resolve(navEntryFor(href)),
    getSitePage(`${section}/${page}`),
  ]);

  // A page is reachable when it is part of the fixed menu or was published
  // from the admin centre.
  if (!entry && !doc) notFound();

  const title = doc?.title ?? entry?.label ?? "Page";
  const parent = entry?.parent ?? (doc?.section ? { label: doc.section } : null);

  return (
    <>
      <PageBanner
        eyebrow={doc?.section ?? entry?.parent?.label ?? undefined}
        title={title}
        crumbs={[
          ...(parent ? [{ label: parent.label, href: parent.href }] : []),
          { label: entry?.label ?? title },
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
