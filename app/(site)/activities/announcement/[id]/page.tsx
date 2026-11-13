import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import PageContent from "@/components/PageContent";
import { getAnnouncement } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getAnnouncement(id);
  return { title: `${item?.title ?? "Announcement"} - University of Nursing, Mandalay` };
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AnnouncementDetail({ params }: Props) {
  const { id } = await params;
  const item = await getAnnouncement(id);
  if (!item) notFound();

  return (
    <>
      <PageBanner
        eyebrow="Announcement"
        title={item.title}
        crumbs={[
          { label: "Activities" },
          { label: "Announcement", href: "/activities/announcement" },
          { label: "Notice" },
        ]}
      />

      <div className="uon-container py-10">
        <article className="uon-card p-6 sm:p-8">
          {formatDate(item.published_at) ? (
            <p className="text-[12px] font-semibold uppercase tracking-wider text-gold-deep">
              {formatDate(item.published_at)}
            </p>
          ) : null}

          <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{item.title}</h1>

          <div className="mt-6">
            <PageContent html={item.body} empty="No further details for this notice." />
          </div>

          <Link
            href="/activities/announcement"
            className="mt-8 inline-block text-[13px] font-semibold text-brand"
          >
            &larr; Back to all announcements
          </Link>
        </article>
      </div>
    </>
  );
}
