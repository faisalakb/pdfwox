"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export type NavTool = { slug: string; name: string };
export type NavCategory = { id: string; label: string; tools: NavTool[] };

export function SiteHeader({ navCategories }: { navCategories: NavCategory[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--color-hero-line)] bg-[var(--color-hero-bg)]/90 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="focus-ring font-display inline-flex items-center gap-2.5 text-lg tracking-tight"
            onClick={() => setMenuOpen(false)}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold"
              style={{ background: "#E2553D", color: "#fff" }}
            >
              W
            </span>
            <span style={{ color: "#F7F2E8" }}>{SITE.shortName}</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1 text-sm">
              {navCategories.map((c) => (
                  <li key={c.id} className="group relative">
                    <button
                      type="button"
                      className="focus-ring inline-flex h-9 items-center gap-1 rounded-[var(--radius-sm)] px-3 transition-colors hover:bg-white/8"
                      style={{ color: "#9AA3C4" }}
                      aria-haspopup="true"
                    >
                      {c.label}
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {/* Dropdown */}
                    <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      <div
                        className="min-w-[260px] rounded-[var(--radius-lg)] border p-2 shadow-[var(--shadow-md)]"
                        style={{
                          background: "#1A2140",
                          borderColor: "#3A4368",
                        }}
                      >
                        <p
                          className="px-3 py-1.5 text-xs tracking-wider uppercase"
                          style={{ color: "#C9B87F" }}
                        >
                          {c.label}
                        </p>
                        <ul>
                          {c.tools.map((t) => (
                            <li key={t.slug}>
                              <Link
                                href={t.slug}
                                className="focus-ring block rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors hover:bg-white/8"
                                style={{ color: "#D8DCEE" }}
                              >
                                {t.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="focus-ring inline-flex h-9 items-center rounded-[var(--radius-sm)] px-3 text-sm transition-colors hover:bg-white/8"
                  style={{ color: "#9AA3C4" }}
                >
                  Guides
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/why-browser-based"
              className="focus-ring hidden h-9 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-sm transition-colors hover:text-white sm:inline-flex"
              style={{ color: "#9AA3C4" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <path
                  d="M12 3l8 4v5c0 4.5-3.4 8.6-8 9-4.6-.4-8-4.5-8-9V7l8-4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Why browser-based
            </Link>

            {/* Hamburger — mobile */}
            <button
              type="button"
              className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-white/8 md:hidden"
              style={{ color: "#9AA3C4" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-20 overflow-y-auto md:hidden"
          style={{ background: "#10152A" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMenuOpen(false);
          }}
        >
          <nav aria-label="Mobile navigation" className="p-4">
            {navCategories.map((c) => (
                <div key={c.id} className="mb-6">
                  <p
                    className="mb-2 px-2 text-xs font-medium tracking-wider uppercase"
                    style={{ color: "#C9B87F" }}
                  >
                    {c.label}
                  </p>
                  <ul className="space-y-0.5">
                    {c.tools.map((t) => (
                      <li key={t.slug}>
                        <Link
                          href={t.slug}
                          className="focus-ring block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors hover:bg-white/8"
                          style={{ color: "#D8DCEE" }}
                          onClick={() => setMenuOpen(false)}
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
            ))}
            <div className="border-t pt-4" style={{ borderColor: "#3A4368" }}>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/blog"
                    className="focus-ring block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors hover:bg-white/8"
                    style={{ color: "#D8DCEE" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/why-browser-based"
                    className="focus-ring block rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors hover:bg-white/8"
                    style={{ color: "#D8DCEE" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Why browser-based
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
