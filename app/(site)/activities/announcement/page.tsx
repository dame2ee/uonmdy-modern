import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import { getAnnouncements } from "@/lib/content";

export const metadata: Metadata = {
  title: "Announcement - University of Nursing, Mandalay",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AnnouncementIndex() {
  const items = await getAnnouncements(60);

  return (
    <>
      <PageBanner
        eyebrow="Activities"
        title="Announcement"
        crumbs={[{ label: "Activities" }, { label: "Announcement" }]}
      />

      <div className="uon-container py-10">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center text-[13.5px] text-muted">
            There are no announcements at the moment.
          </p>
        ) : (
          <ul className="grid gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/activities/announcement/${item.id}`}
                  className="uon-card group flex items-start gap-4 px-5 py-4 transition-colors hover:border-brand"
                >
                  <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-gold" />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-relaxed text-ink group-hover:text-brand">
                      {item.title}
                    </span>
                    {item.category ? (
                      <span className="mt-1 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand">
                        {item.category}
                      </span>
                    ) : null}
                  </span>
                  {formatDate(item.published_at) ? (
                    <span className="ml-auto hidden shrink-0 text-[12px] font-medium text-muted sm:block">
                      {formatDate(item.published_at)}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
