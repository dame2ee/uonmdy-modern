import Image from "next/image";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";

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

        <SearchForm />
      </div>
    </header>
  );
}
