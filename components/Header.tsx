import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-navy-deep via-navy to-brand">
      {/* Utility strip */}
      <div className="border-b border-white/10">
        <div className="uon-container flex h-9 items-center justify-between gap-4 text-[12px] text-white/60">
          <p className="truncate">University of Nursing, Mandalay</p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:uonadmin@uonmdy.edu.mm"
              className="hidden text-white/70 hover:text-white sm:inline"
            >
              uonadmin@uonmdy.edu.mm
            </a>
            <span className="hidden h-3 w-px bg-white/20 sm:inline-block" />
            <span className="text-white/70">(+95) 02 4080405</span>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="uon-container flex flex-col items-center gap-4 py-5 sm:flex-row sm:justify-between">
        <Link href="/" title="University of Nursing, Mandalay." className="inline-flex items-center">
          <Image
            src="/images/misc/logo.png"
            alt="University of Nursing, Mandalay."
            width={330}
            height={66}
            priority
            className="h-[54px] w-auto max-w-full"
          />
        </Link>

        <form
          role="search"
          className="flex w-full max-w-[360px] items-center gap-1 rounded-full bg-white/95 p-1 shadow-lg shadow-navy-deep/20"
        >
          <label htmlFor="searchword" className="hidden">
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
            id="searchword"
            name="searchword"
            type="search"
            maxLength={200}
            placeholder="Search the university…"
            className="min-w-0 flex-1 bg-transparent px-1 text-[13px] text-ink outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-navy"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
