import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/cn";

export function ToolCard({
  tool,
  emphasize = false,
}: {
  tool: Tool;
  emphasize?: boolean;
}) {
  return (
    <Link
      href={tool.slug}
      className={cn(
        "focus-ring group relative flex h-full flex-col justify-between gap-6 rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-5 transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-quart)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        emphasize
          ? "border-[var(--color-accent)]"
          : "border-[var(--color-line)]",
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-full px-2 text-[10px] tracking-wider uppercase",
              tool.runtime === "server"
                ? "bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
                : "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
            )}
          >
            {tool.runtime === "server" ? "Server" : "In-browser"}
          </span>
          {tool.status === "soon" && (
            <span className="text-[10px] tracking-wider text-[var(--color-ink-subtle)] uppercase">
              Coming soon
            </span>
          )}
        </div>
        <h3 className="font-display mt-3 text-lg">{tool.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {tool.shortDescription}
        </p>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)]">
        Open tool
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        >
          <path
            d="M5 10h10m0 0l-4-4m4 4l-4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
