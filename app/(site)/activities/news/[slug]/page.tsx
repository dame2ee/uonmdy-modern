import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBanner from "@/components/PageBanner";
import PageContent from "@/components/PageContent";
import { getNewsBySlug } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  return { title: `${item?.title ?? "News"} - University of Nursing, Mandalay` };
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <PageBanner
        eyebrow="News"
        title={item.title}
        crumbs={[
          { label: "Activities" },
          { label: "News", href: "/activities/news" },
          { label: "Article" },
        ]}
      />

      <div className="uon-container py-10">
        <article className="uon-card overflow-hidden">
          {item.image_url ? (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div className="p-6 sm:p-8">
            {formatDate(item.published_at) ? (
              <p className="text-[12px] font-semibold uppercase tracking-wider text-gold-deep">
                {formatDate(item.published_at)}
              </p>
            ) : null}

            <h1 className="mt-2 text-xl font-bold text-ink sm:text-2xl">{item.title}</h1>

            {item.excerpt ? (
              <p className="mt-4 text-[14px] font-medium leading-relaxed text-body">
                {item.excerpt}
              </p>
            ) : null}

            <div className="mt-6">
              <PageContent html={item.body} empty="No further details for this article." />
            </div>

            <Link
              href="/activities/news"
              className="mt-8 inline-block text-[13px] font-semibold text-brand"
            >
              &larr; Back to all news
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
