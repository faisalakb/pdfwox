"use client";

import * as React from "react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/cn";

export function ToolFilter({ tools }: { tools: Tool[] }) {
  const [q, setQ] = React.useState("");
  const norm = q.trim().toLowerCase();

  const results = React.useMemo(() => {
    if (!norm) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(norm) ||
        t.shortDescription.toLowerCase().includes(norm) ||
        t.primaryKeyword.toLowerCase().includes(norm) ||
        t.slug.toLowerCase().includes(norm),
    );
  }, [norm, tools]);

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[var(--color-ink-muted)]"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find a tool — e.g. heic, redact, sign, unlock"
          aria-label="Search PDF tools"
          className="focus-ring h-14 w-full rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] pr-12 pl-12 text-base shadow-[var(--shadow-sm)] placeholder:text-[var(--color-ink-subtle)]"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="focus-ring absolute top-1/2 right-3 h-8 w-8 -translate-y-1/2 rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {norm && (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
              No tools match “{q}”.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-line)]">
              {results.slice(0, 8).map((t) => (
                <li key={t.slug}>
                  <Link
                    href={t.slug}
                    className={cn(
                      "focus-ring flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--color-surface-muted)]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{t.name}</p>
                      <p className="truncate text-sm text-[var(--color-ink-muted)]">
                        {t.shortDescription}
                      </p>
                    </div>
                    <span className="text-sm text-[var(--color-accent)]">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
