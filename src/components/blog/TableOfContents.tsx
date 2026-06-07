import Link from "next/link";

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null;
  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
    >
      <p className="text-xs tracking-wider text-[var(--color-ink-subtle)] uppercase">
        On this page
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
            <Link
              href={`#${h.id}`}
              className="focus-ring text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              {h.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
