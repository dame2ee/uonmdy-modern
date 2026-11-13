/**
 * Search box used by the masthead and by the search results page. It is a plain
 * GET form, so it works without JavaScript and can be bookmarked.
 */

type Props = {
  /** Pre-fills the box, e.g. with the term shown on the results page. */
  defaultValue?: string;
  variant?: "header" | "page";
};

export default function SearchForm({ defaultValue = "", variant = "header" }: Props) {
  const onPage = variant === "page";
  const inputId = onPage ? "searchword-page" : "searchword";

  return (
    <form
      role="search"
      action="/search"
      method="get"
      className={
        onPage
          ? "flex w-full max-w-[520px] items-center gap-1 rounded-full border border-line bg-white p-1.5 shadow-sm"
          : "flex w-full max-w-[360px] items-center gap-1 rounded-full bg-white/95 p-1 shadow-lg shadow-navy-deep/20"
      }
    >
      <label htmlFor={inputId} className="hidden">
        Search ...
      </label>
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="ml-2.5 shrink-0 text-muted"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4.2-4.2" strokeLinecap="round" />
      </svg>
      <input
        id={inputId}
        name="searchword"
        type="search"
        maxLength={200}
        defaultValue={defaultValue}
        placeholder="Search the university…"
        className={
          onPage
            ? "min-w-0 flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted"
            : "min-w-0 flex-1 bg-transparent px-1 text-[13px] text-ink outline-none placeholder:text-muted"
        }
      />
      <button
        type="submit"
        className={
          onPage
            ? "shrink-0 rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy"
            : "shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-navy"
        }
      >
        Search
      </button>
    </form>
  );
}
