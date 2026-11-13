import Image from "next/image";
import { mostRead, newsPagination, visitorStats } from "@/lib/data";
import type { NewsItem, Rector } from "@/lib/types";

const visitorRows = [
  { label: "Today", value: visitorStats.today },
  { label: "Yesterday", value: visitorStats.yesterday },
  { label: "This Week", value: visitorStats.thisWeek },
  { label: "This Month", value: visitorStats.thisMonth },
  { label: "All days", value: visitorStats.all },
];

export default function SpotlightOne({
  news,
  rectors,
}: {
  news: NewsItem[];
  rectors: Rector[];
}) {
  const digits = String(visitorStats.all).split("");

  return (
    <section className="uon-container py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---------- Latest News ---------- */}
        <div className="uon-card flex flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="uon-section-title text-base">Latest News</h2>
            <a className="text-[12px] font-semibold text-brand hover:text-navy">More news &rarr;</a>
          </div>

          <div className="mt-4 space-y-4">
            {news.map((item) => (
              <article key={item.id} className="group flex gap-3">
                <a className="relative h-[74px] w-[110px] shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.image_url ?? "/images/news/1.jpg"}
                    alt={item.title}
                    fill
                    sizes="110px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </a>
                <div className="min-w-0">
                  <a className="line-clamp-3 text-[13px] font-semibold leading-snug text-ink hover:text-brand">
                    {item.title}
                  </a>
                  <a className="mt-1 inline-block text-[12px] font-medium text-muted hover:text-brand">
                    Read more
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-line pt-4">
            {newsPagination.map((label, i) => (
              <a
                key={label}
                className={[
                  "flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[12px] font-semibold transition-colors",
                  i === newsPagination.length - 1
                    ? "bg-brand text-white hover:bg-navy"
                    : "bg-mist text-body ring-1 ring-line hover:bg-brand-soft hover:text-brand",
                ].join(" ")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ---------- Rectors ---------- */}
        <div className="uon-card p-5">
          <h2 className="uon-section-title text-base">Rectors</h2>
          <ul className="mt-4 space-y-1">
            {rectors.map((rector) => (
              <li
                key={rector.id}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-mist"
              >
                <Image
                  src={rector.image_url ?? "/images/rectors/1.jpg"}
                  alt={rector.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                />
                <span className="text-[13.5px] font-semibold text-ink">
                  {rector.name}
                  <span className="block text-[12px] font-normal text-muted">{rector.period}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- Most Read + Visitors ---------- */}
        <div className="flex flex-col gap-6">
          <div className="uon-card p-5">
            <h2 className="uon-section-title text-base">Most Read &amp; Viewed</h2>
            <ul className="mt-4 space-y-1">
              {mostRead.map((label) => (
                <li key={label}>
                  <a className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-body transition-colors hover:bg-brand-soft hover:text-brand">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="uon-card p-5">
            <h2 className="uon-section-title mb-4 text-base">Visitors</h2>

            <div className="flex justify-center">
              {digits.map((digit, i) => (
                <span key={i} className="uon-digit" title="Vinaora Visitors Counter">
                  {digit}
                </span>
              ))}
            </div>

            <dl className="mt-4 divide-y divide-line text-[12.5px]">
              {visitorRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1.5">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {row.value.toLocaleString()}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 text-[12px] text-muted">
              Your IP: <span className="font-medium text-body">{visitorStats.ip}</span>
            </p>
            <p className="text-[12px] text-muted">{visitorStats.datetime}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
