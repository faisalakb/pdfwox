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

        <div className="mb-8 max-w-2xl space-y-3 leading-relaxed text-[var(--color-ink-muted)]">
          <p>
            Working with PDFs is something almost everyone has to do, but the
            tools and terminology are often confusing. These guides explain the
            most common tasks in plain language — what the steps are, why they
            work that way, and what to watch out for. Every guide links to a
            free tool on this site so you can apply what you read immediately.
          </p>
          <p>
            Topics covered include making a PDF fillable, signing documents
            electronically, redacting sensitive information, converting iPhone
            HEIC photos and other image formats to PDF, running OCR to make
            scanned documents searchable, and adding or removing watermarks and
            passwords. New guides are published alongside new tools.
          </p>
        </div>

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
