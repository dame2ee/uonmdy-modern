import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import { getNews } from "@/lib/content";

export const metadata: Metadata = {
  title: "News - University of Nursing, Mandalay",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsIndex() {
  const news = await getNews(60);

  return (
    <>
      <PageBanner
        eyebrow="Activities"
        title="News"
        crumbs={[{ label: "Activities" }, { label: "News" }]}
      />

      <div className="uon-container py-10">
        {news.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center text-[13.5px] text-muted">
            No news has been published yet.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <li key={item.id} className="uon-card group flex flex-col overflow-hidden">
                <Link
                  href={`/activities/news/${item.slug}`}
                  className="relative block aspect-[16/10] overflow-hidden"
                >
                  <Image
                    src={item.image_url ?? "/images/news/1.jpg"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-[14px] font-semibold leading-snug text-ink">
                    <Link href={`/activities/news/${item.slug}`} className="hover:text-brand">
                      {item.title}
                    </Link>
                  </h2>
                  {formatDate(item.published_at) ? (
                    <p className="mt-2 text-[12px] font-medium text-muted">
                      {formatDate(item.published_at)}
                    </p>
                  ) : null}
                  <Link
                    href={`/activities/news/${item.slug}`}
                    className="mt-auto pt-3 text-[12px] font-semibold text-brand"
                  >
                    Read more &rarr;
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
