"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { galleryImages } from "@/lib/data";

const PER_PAGE = 6;

export default function PhotoGallery() {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(galleryImages.length / PER_PAGE);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, 6000);
    return () => window.clearInterval(id);
  }, [pageCount]);

  const start = page * PER_PAGE;
  const visible = galleryImages.slice(start, start + PER_PAGE);

  return (
    <section className="bg-mist py-12">
      <div className="uon-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="uon-eyebrow">Campus life</span>
            <h2 className="uon-section-title mt-1 text-xl sm:text-2xl">Photo Gallery</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => (p - 1 + pageCount) % pageCount)}
              aria-label="Previous photos"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-body shadow-sm transition-colors hover:bg-brand hover:text-white"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => (p + 1) % pageCount)}
              aria-label="Next photos"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-body shadow-sm transition-colors hover:bg-brand hover:text-white"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {visible.map((src) => (
            <a
              key={src}
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="uon-fade-in group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-black/5"
            >
              <Image
                src={src}
                alt="UONMDY photo gallery"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-navy-deep/0 transition-colors group-hover:bg-navy-deep/30" />
              <span className="absolute right-3 bottom-3 flex h-7 w-7 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[16px] leading-none text-navy opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                +
              </span>
            </a>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Gallery page ${i + 1}`}
              aria-current={i === page}
              className={[
                "h-1.5 rounded-full transition-all",
                i === page ? "w-6 bg-brand" : "w-1.5 bg-line hover:bg-muted",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
