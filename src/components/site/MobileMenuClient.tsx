"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavCategory } from "./SiteHeader";

export function MobileMenuClient({
  navCategories,
}: {
  navCategories: NavCategory[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-white/8 md:hidden"
        style={{ color: "#9AA3C4" }}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {menuOpen ? (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M18 6 6 18M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

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
