import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { guides } from "@/lib/guides";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain-language how-to guides for working with PDFs in your browser. No fluff, no signup.",
  alternates: { canonical: `${SITE.url}/blog` },
};

export default function BlogIndex() {
  return (
    <section className="py-12">
      <Container size="lg">
        <header className="mb-10 max-w-2xl">
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            Guides
          </p>
          <h1 className="mt-2">PDF how-tos that respect your time</h1>
          <p className="mt-3 text-lg leading-relaxed text-[var(--color-ink-muted)]">
            Each guide pairs with a free tool on this site. Read, then do it in
            your browser — no signup.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <Card key={g.slug}>
              <p className="text-xs tracking-wider text-[var(--color-ink-subtle)] uppercase">
                Guide
              </p>
              <h2 className="font-display mt-1 text-lg">
                <Link
                  href={`/blog/${g.slug}`}
                  className="focus-ring hover:text-[var(--color-accent)]"
                >
                  {g.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {g.excerpt}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
