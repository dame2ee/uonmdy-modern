"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { slides } from "@/lib/data";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const go = useCallback((dir: 1 | -1) => {
    setIndex((prev) => (prev + dir + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => go(1), 6000);
    return () => window.clearInterval(id);
  }, [playing, go]);

  const current = slides[index];

  return (
    <section className="uon-container pt-6 pb-2 sm:pt-8">
      <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-pop)] ring-1 ring-black/5">
        <div className="relative h-[300px] sm:h-[420px] lg:h-[520px]">
          {slides.map((slide, i) => (
            <div
              key={slide.image}
              className={[
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                i === index ? "opacity-100" : "opacity-0",
              ].join(" ")}
              aria-hidden={i !== index}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                sizes="(max-width: 1200px) 100vw, 1200px"
                className={[
                  "object-cover transition-transform duration-[6000ms] ease-out",
                  i === index ? "scale-105" : "scale-100",
                ].join(" ")}
              />
            </div>
          ))}

          {/* Readability gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/30 to-transparent" />

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <div key={index} className="uon-fade-in max-w-2xl">
              <span className="uon-eyebrow text-gold">University of Nursing, Mandalay</span>
              <h2 className="mt-2 text-2xl leading-tight text-white sm:text-3xl lg:text-4xl">
                {current.title}
              </h2>
              {current.description ? (
                <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                  {current.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute top-1/2 left-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/35"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute top-1/2 right-4 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/35"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots + play/pause */}
          <div className="absolute right-5 bottom-5 flex items-center gap-3 sm:right-8 sm:bottom-8">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/35"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                  <path d="M8 5l11 7-11 7z" />
                </svg>
              )}
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={[
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-gold" : "w-2 bg-white/50 hover:bg-white/80",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
