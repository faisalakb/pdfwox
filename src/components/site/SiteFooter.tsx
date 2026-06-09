import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import { allCategories, categoryMeta, toolsByCategory } from "@/lib/tools";

export function SiteFooter() {
  const byCat = toolsByCategory();

  return (
    <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-surface-muted)]">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2">
            <Link
              href="/"
              className="focus-ring font-display inline-flex items-center gap-2 text-lg"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] text-xs font-bold text-[var(--color-accent-ink)]"
              >
                P
              </span>
              {SITE.shortName}
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {SITE.description}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-ink-muted)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
              />
              {SITE.tagline}
            </p>
          </div>
          {allCategories.map((c) => {
            const list = byCat[c];
            if (!list.length) return null;
            return (
              <div key={c}>
                <h4 className="text-xs font-semibold tracking-wider text-[var(--color-ink)] uppercase">
                  {categoryMeta[c].label}
                </h4>
                <ul className="mt-3 space-y-2">
                  {list.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={t.slug}
                        className="focus-ring text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-ink-muted)] md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link
                href="/about"
                className="focus-ring hover:text-[var(--color-ink)]"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="focus-ring hover:text-[var(--color-ink)]"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/why-browser-based"
                className="focus-ring hover:text-[var(--color-ink)]"
              >
                Why browser-based
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="focus-ring hover:text-[var(--color-ink)]"
              >
                Guides
              </Link>
            </li>
            <li>
              <Link
                href="/changelog"
                className="focus-ring hover:text-[var(--color-ink)]"
              >
                Changelog
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
