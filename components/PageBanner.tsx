import Link from "next/link";

type Crumb = { label: string; href?: string };

/** Navy page banner with a breadcrumb trail, used by every inner page. */
export default function PageBanner({
  eyebrow,
  title,
  crumbs = [],
}: {
  eyebrow?: string;
  title: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-navy-deep via-navy to-brand">
      <div className="uon-container py-9">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/70"
        >
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              <span className="text-white/40">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-white">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white/90">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {eyebrow ? (
          <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-1.5 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      </div>
    </section>
  );
}
