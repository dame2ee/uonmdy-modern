import { announcements } from "@/lib/data";

export default function Announcements() {
  return (
    <section className="uon-container pt-6 pb-2">
      <div className="uon-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-mist px-5 py-4">
          <h2 className="uon-section-title text-base">Announcements</h2>
          <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-muted ring-1 ring-line">
            {announcements.length} notices
          </span>
        </div>

        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item, index) => (
            <li key={index} className="bg-white">
              <a className="group flex h-full flex-col gap-3 p-5 transition-colors hover:bg-brand-soft/60">
                <span className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span className="text-[13.5px] font-semibold leading-relaxed text-ink transition-colors group-hover:text-brand">
                    {item.title}
                  </span>
                </span>
                <span className="mt-auto pl-[18px] text-[12px] font-semibold text-brand">
                  Read more &rarr;
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
