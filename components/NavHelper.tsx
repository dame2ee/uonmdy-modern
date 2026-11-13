import CountUp from "./CountUp";
import type { CampusStat } from "@/lib/types";

/** Icon key -> SVG path, matching the `icon` column in `campus_stats`. */
const icons: Record<string, string> = {
  // teaching staff
  staff:
    "M12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 10c4 0 7 2.2 7 5v3H5v-3c0-2.8 3-5 7-5Z",
  // office staff
  office:
    "M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-2 7h4c0-1.3-.9-2-2-2s-2 .7-2 2Zm7-6h6v1.5h-6V10Zm0 3h6v1.5h-6V13Z",
  // under graduate students
  student:
    "M8 11a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm8 1a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM2 20v-1.5C2 16 5 14 8 14s6 2 6 4.5V20H2Zm14.5-4.7c2.6.4 4.5 2 4.5 4.2V20h-5v-1.5c0-1.2-.4-2.3-1-3.2.5 0 1-.1 1.5 0Z",
  // post graduate students
  postgrad:
    "M12 3 1 8l11 5 9-4.1V16h2V8L12 3ZM5 12.6V16c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.4l-7 3.2-7-3.2Z",
  // graduates
  graduate:
    "M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 3.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM8.5 14.5 7 22l5-2.6L17 22l-1.5-7.5a7.9 7.9 0 0 1-7 0Z",
};

const fallbackOrder = ["staff", "office", "student", "postgrad", "graduate"];

export default function NavHelper({ stats }: { stats: CampusStat[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="border-y border-line bg-white py-12">
      <div className="uon-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="uon-eyebrow">By the numbers</span>
          <h2 className="mt-2 text-2xl text-ink sm:text-3xl">University at a glance</h2>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat, i) => {
            const key =
              stat.icon && icons[stat.icon]
                ? stat.icon
                : fallbackOrder[i % fallbackOrder.length];

            return (
              <div
                key={stat.id}
                className="group rounded-2xl border border-line bg-mist p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:bg-white hover:shadow-soft"
              >
                <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                    <path d={icons[key]} />
                  </svg>
                </span>
                <div className="text-3xl font-bold tabular-nums text-ink">
                  <CountUp to={stat.value} duration={2500} />
                </div>
                <div className="mt-1 text-[12.5px] font-medium text-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
