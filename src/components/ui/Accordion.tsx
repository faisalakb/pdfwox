import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Native <details>/<summary> accordion. Zero JS, fully accessible,
 * works without hydration — important for SEO content visible without JS.
 */
export function Accordion({
  items,
  className,
}: {
  items: Array<{ q: React.ReactNode; a: React.ReactNode }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]",
        className,
      )}
    >
      {items.map((item, i) => (
        <details
          key={i}
          className={cn(
            "group [&_summary::-webkit-details-marker]:hidden",
            i > 0 && "border-t border-[var(--color-line)]",
          )}
        >
          <summary className="focus-ring flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-base font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]">
            <span>{item.q}</span>
            <svg
              className="h-5 w-5 shrink-0 text-[var(--color-ink-muted)] transition-transform group-open:rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </summary>
          <div className="px-5 pb-5 leading-relaxed text-[var(--color-ink-muted)]">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
