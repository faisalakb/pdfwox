import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import { allCategories, categoryMeta, toolsByCategory } from "@/lib/tools";

export function SiteHeader() {
  const byCat = toolsByCategory();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-canvas)_82%,transparent)] backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="focus-ring font-display inline-flex items-center gap-2 text-lg tracking-tight"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-xs font-bold text-[var(--color-accent-ink)]"
          >
            P
          </span>
          {SITE.shortName}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm">
            {allCategories.map((c) => {
              const list = byCat[c];
              if (!list.length) return null;
              return (
                <li key={c} className="group relative">
                  <button
                    type="button"
                    className="focus-ring inline-flex h-9 items-center gap-1 rounded-[var(--radius-sm)] px-3 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
                    aria-haspopup="true"
                  >
                    {categoryMeta[c].label}
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
                  <div className="invisible absolute top-full left-0 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-[260px] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-md)]">
                      <p className="px-3 py-1.5 text-xs tracking-wider text-[var(--color-ink-subtle)] uppercase">
                        {categoryMeta[c].label}
                      </p>
                      <ul>
                        {list.map((t) => (
                          <li key={t.slug}>
                            <Link
                              href={t.slug}
                              className="focus-ring block rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-muted)]"
                            >
                              {t.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
            <li>
              <Link
                href="/blog"
                className="focus-ring inline-flex h-9 items-center rounded-[var(--radius-sm)] px-3 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
              >
                Guides
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/why-browser-based"
            className="focus-ring hidden h-9 items-center gap-1 rounded-[var(--radius-sm)] px-3 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] sm:inline-flex"
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
        </div>
      </Container>
    </header>
  );
}
