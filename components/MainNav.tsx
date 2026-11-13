"use client";

import { useState } from "react";
import LoginSidebar from "./LoginSidebar";
import { navItems } from "@/lib/data";

export default function MainNav() {
  const [navOpen, setNavOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-navy-deep via-navy to-brand shadow-[0_18px_40px_-24px_rgba(7,39,68,0.95)]">
      <div className="uon-container">
        <div className="flex items-center justify-between gap-3 py-2.5">
          {/* Mobile nav toggle */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 md:hidden"
          >
            <span className="flex flex-col gap-[4px]">
              <span className="block h-[2px] w-[18px] bg-current" />
              <span className="block h-[2px] w-[18px] bg-current" />
              <span className="block h-[2px] w-[18px] bg-current" />
            </span>
            Menu
          </button>

          {/* Desktop links */}
          <ul className="hidden items-center md:flex">
            {navItems.map((item) => {
              const isActive = item.label === "Home";
              return (
                <li key={item.label} className="group relative">
                  <a
                    href={item.href}
                    className={[
                      "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                      isActive
                        ? "bg-white text-navy shadow-sm"
                        : "text-white/85 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                    {item.children ? (
                      <svg
                        viewBox="0 0 12 8"
                        width="9"
                        height="6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                      >
                        <path d="M1 1.5 6 6.5l5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </a>

                  {item.children ? (
                    <div className="uon-mega">
                      <ul>
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <a href={child.href}>{child.label}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Login trigger */}
          <button
            type="button"
            aria-label="Open login form"
            aria-expanded={loginOpen}
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-white hover:text-navy"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 12c4.4 0 8 2.3 8 5.2V21H4v-1.8C4 16.3 7.6 14 12 14Z" />
            </svg>
            <span className="hidden sm:inline">Login</span>
          </button>
        </div>

        {/* Mobile list */}
        <ul className={`${navOpen ? "block" : "hidden"} pb-4 md:hidden`}>
          {navItems.map((item) => (
            <li key={item.label} className="border-t border-white/10">
              <a href={item.href} className="block py-3 text-[14px] font-semibold text-white">
                {item.label}
              </a>
              {item.children ? (
                <ul className="pb-2 pl-3">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <a href={child.href} className="block py-1.5 text-[13px] text-white/70">
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <LoginSidebar open={loginOpen} onClose={() => setLoginOpen(false)} />
    </nav>
  );
}
