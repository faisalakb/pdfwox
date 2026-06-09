import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { relatedGuides } from "@/lib/guides";

export function RelatedGuides({ slug }: { slug: string }) {
  const related = relatedGuides(slug, 3);
  if (related.length === 0) return null;
  return (
    <section className="my-8">
      <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
        Related guides
      </p>
      <h3 className="font-display mt-1 text-lg">Keep reading</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((g) => (
          <Card key={g.slug}>
            <h4 className="text-base font-medium">
              <Link
                href={`/blog/${g.slug}`}
                className="focus-ring hover:text-[var(--color-accent)]"
              >
                {g.title}
              </Link>
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {g.excerpt}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
