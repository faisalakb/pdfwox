import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getTool } from "@/lib/tools";

export function UseToolCta({ toolSlug }: { toolSlug: string }) {
  const tool = getTool(toolSlug);
  if (!tool) return null;
  return (
    <Card className="my-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
          Use the tool
        </p>
        <h3 className="font-display mt-1 text-lg">{tool.name}</h3>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {tool.shortDescription}
        </p>
      </div>
      <Link
        href={tool.slug}
        className="focus-ring inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-5 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
      >
        Open {tool.name}
        <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}
