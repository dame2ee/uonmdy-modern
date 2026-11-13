import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import SearchForm from "@/components/SearchForm";
import { MIN_SEARCH_LENGTH, searchContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Search - University of Nursing, Mandalay",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ searchword?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = firstValue(params.searchword ?? params.q).trim().slice(0, 80);
  const longEnough = query.length >= MIN_SEARCH_LENGTH;
  const results = longEnough ? await searchContent(query) : [];

  return (
    <>
      <PageBanner
        eyebrow="Search"
        title={query ? `Search results for “${query}”` : "Search"}
        crumbs={[{ label: "Search" }]}
      />

      <div className="uon-container py-10">
        <SearchForm variant="page" defaultValue={query} />

        {!query ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center text-[13.5px] text-muted">
            Type a word or phrase above to search the university pages, news and announcements.
          </p>
        ) : !longEnough ? (
          <p className="mt-8 rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center text-[13.5px] text-muted">
            Please enter at least {MIN_SEARCH_LENGTH} characters.
          </p>
        ) : results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-mist px-5 py-10 text-center">
            <p className="text-[13.5px] font-medium text-ink">
              No results found for “{query}”.
            </p>
            <p className="mt-2 text-[13px] text-muted">
              Try a shorter word, a different spelling, or browse the{" "}
              <Link href="/" className="font-semibold text-brand hover:underline">
                home page
              </Link>{" "}
              menu.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-6 text-[13px] text-muted">
              {results.length} {results.length === 1 ? "result" : "results"} found.
            </p>

            <ul className="mt-4 space-y-4">
              {results.map((hit) => (
                <li key={`${hit.kind}-${hit.id}`} className="uon-card p-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand">
                      {hit.kind}
                    </span>
                    {hit.context ? (
                      <span className="text-[12px] text-muted">{hit.context}</span>
                    ) : null}
                    {formatDate(hit.publishedAt) ? (
                      <span className="text-[12px] text-muted">
                        {formatDate(hit.publishedAt)}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-2 text-[15px] font-semibold leading-snug text-ink">
                    <Link href={hit.href} className="hover:text-brand">
                      {hit.title}
                    </Link>
                  </h2>

                  {hit.snippet ? (
                    <p className="mt-2 text-[13.5px] leading-relaxed text-body">{hit.snippet}</p>
                  ) : null}

                  <Link
                    href={hit.href}
                    className="mt-3 inline-block text-[12px] font-semibold text-brand"
                  >
                    Open &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
