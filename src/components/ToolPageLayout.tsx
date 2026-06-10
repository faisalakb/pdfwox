import Link from "next/link";
import { WorkerPrewarm } from "@/components/WorkerPrewarm";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import {
  breadcrumbListLd,
  faqPageLd,
  howToLd,
  jsonLdString,
  softwareApplicationLd,
} from "@/lib/seo";
import { SITE } from "@/lib/site";
import { categoryMeta, relatedTools, type Tool } from "@/lib/tools";

export interface ToolPageLayoutProps {
  tool: Tool;
  /** The `<ToolShell>` instance (client component) goes here. */
  children: React.ReactNode;
  /** Optional intro paragraph override. Defaults to `tool.description`. */
  intro?: React.ReactNode;
}

/**
 * Server component. Per-tool template that wraps a ToolShell and renders
 * all the SEO-by-construction blocks: breadcrumb, H1, intro, how-to steps,
 * FAQ accordion, related tools, privacy line, and combined JSON-LD.
 */
export function ToolPageLayout({ tool, children, intro }: ToolPageLayoutProps) {
  const related = relatedTools(tool.slug, 5);
  const breadcrumbs = [
    { name: "Home", url: SITE.url },
    {
      name: categoryMeta[tool.category].label,
      url: `${SITE.url}/#${tool.category}`,
    },
    { name: tool.name, url: `${SITE.url}${tool.slug}` },
  ];

  const ld = jsonLdString(
    softwareApplicationLd(tool),
    howToLd(tool),
    faqPageLd(tool.faqs),
    breadcrumbListLd(breadcrumbs),
  );

  return (
    <>
      <WorkerPrewarm />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />

      <section className="pt-10 pb-8">
        <Container size="lg">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-1.5 text-[var(--color-ink-muted)]">
              {breadcrumbs.map((b, i) => (
                <li key={b.url} className="flex items-center gap-1.5">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="text-[var(--color-ink-subtle)]"
                    >
                      /
                    </span>
                  )}
                  {i === breadcrumbs.length - 1 ? (
                    <span
                      aria-current="page"
                      className="text-[var(--color-ink)]"
                    >
                      {b.name}
                    </span>
                  ) : (
                    <Link
                      href={b.url === SITE.url ? "/" : b.url}
                      className="focus-ring hover:text-[var(--color-ink)]"
                    >
                      {b.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="mt-5">{tool.h1}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
            {intro ?? tool.description}
          </p>

          {/* Privacy line — visible without JS, key trust signal */}
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-ink-muted)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
            />
            {tool.privacyLine}
          </p>
        </Container>
      </section>

      {/* Tool shell slot */}
      <section className="pb-12">
        <Container size="lg">{children}</Container>
      </section>

      {/* About this tool — long-form text for context and SEO */}
      {tool.longDescription.length > 0 && (
        <section className="py-12">
          <Container size="md">
            <h2 className="text-3xl">About this tool</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-[var(--color-ink-muted)]">
              {tool.longDescription.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* How-to — rendered as numbered list, visible without JS for SEO */}
      <section className="bg-[var(--color-surface-muted)] py-12">
        <Container size="lg">
          <h2 className="text-3xl">How it works</h2>
          <ol className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {tool.howTo.map((step, i) => (
              <li key={step.name}>
                <Card>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-medium text-[var(--color-accent-ink)]">
                    {i + 1}
                  </span>
                  <h3 className="font-display mt-3 text-lg">{step.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {step.text}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <Container size="md">
          <h2 className="text-3xl">Frequently asked questions</h2>
          <div className="mt-6">
            <Accordion items={tool.faqs.map((f) => ({ q: f.q, a: f.a }))} />
          </div>
        </Container>
      </section>

      {/* Related tools */}
      {related.length > 0 && (
        <section className="py-12">
          <Container size="lg">
            <h2 className="text-3xl">Related tools</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t) => (
                <Card key={t.slug}>
                  <h3 className="text-base font-medium">
                    <Link
                      href={t.slug}
                      className="focus-ring hover:text-[var(--color-accent)]"
                    >
                      {t.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {t.shortDescription}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Embed this tool */}
      <section className="py-12">
        <Container size="lg">
          <Card>
            <h2 className="text-xl font-semibold">Embed this tool</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Let your visitors use <strong>{tool.name}</strong> without leaving
              your site. Paste the snippet below into any HTML page. Files stay
              private — everything runs in the visitor's browser.
            </p>
            <div className="mt-4">
              <EmbedSnippet toolSlug={tool.slug} />
            </div>
          </Card>
        </Container>
      </section>

      {/* Guide CTA */}
      {tool.guideSlug && (
        <section className="py-12">
          <Container size="lg">
            <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
                  Deeper guide
                </p>
                <h3 className="font-display mt-1 text-lg">
                  Read the full how-to
                </h3>
              </div>
              <Link
                href={`/blog/${tool.guideSlug}`}
                className="focus-ring inline-flex h-11 items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 text-sm font-semibold text-[var(--color-accent-ink)] transition-all hover:scale-105 hover:brightness-110"
              >
                Open the guide
                <span aria-hidden="true">→</span>
              </Link>
            </Card>
          </Container>
        </section>
      )}
    </>
  );
}
