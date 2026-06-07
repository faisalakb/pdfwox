import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ToolFilter } from "@/components/home/ToolFilter";
import { ToolCard } from "@/components/home/ToolCard";
import {
  allCategories,
  categoryMeta,
  popularTools,
  tools,
  toolsByCategory,
} from "@/lib/tools";
import { jsonLdString, organizationLd, websiteLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const TRUST_ITEMS = [
  {
    title: "Works in your browser",
    body: "Drag a file, get a result. The page does the work — no server round-trip.",
  },
  {
    title: "No signup, ever",
    body: "Every tool is free and accountless. No email, no paywall, no watermark.",
  },
  {
    title: "Files stay private",
    body: "Client-side tools never upload your file. Server tools delete it immediately.",
  },
];

export default function Home() {
  const byCat = toolsByCategory();
  const popular = popularTools();

  const jsonLd = jsonLdString(organizationLd(), websiteLd());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      {/* Hero */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16">
        <Container size="lg">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-ink-muted)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
              />
              {SITE.tagline}
            </span>
            <h1 className="mt-5">
              PDF tools that respect your{" "}
              <em className="text-[var(--color-accent)] not-italic">files</em>{" "}
              and your{" "}
              <em className="text-[var(--color-accent)] not-italic">time</em>.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
              Fill forms, sign, redact, convert, protect — all in your browser.
              Nothing is uploaded. No accounts. No subscriptions.
            </p>
          </div>

          <div className="mt-8 max-w-2xl">
            <ToolFilter tools={tools} />
          </div>
        </Container>
      </section>

      {/* Popular row */}
      <section className="py-10" aria-labelledby="popular-heading">
        <Container size="lg">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="popular-heading" className="text-3xl">
                Popular tools
              </h2>
              <p className="mt-1 text-[var(--color-ink-muted)]">
                The ones most people open first.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((t) => (
              <ToolCard key={t.slug} tool={t} emphasize />
            ))}
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section
        className="my-8 bg-[var(--color-surface-muted)] py-12"
        aria-labelledby="trust-heading"
      >
        <Container size="lg">
          <h2 id="trust-heading" className="sr-only">
            How this site is different
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path
                      d="M5 10l3 3 7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Category bands */}
      {allCategories.map((cat) => {
        const list = byCat[cat];
        if (!list.length) return null;
        const meta = categoryMeta[cat];
        return (
          <section
            key={cat}
            className="py-10"
            aria-labelledby={`band-${cat}-heading`}
          >
            <Container size="lg">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 id={`band-${cat}-heading`} className="text-3xl">
                    {meta.label}
                  </h2>
                  <p className="mt-1 text-[var(--color-ink-muted)]">
                    {meta.tagline}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </Container>
          </section>
        );
      })}

      {/* Why-browser-based CTA */}
      <section className="py-16">
        <Container size="lg">
          <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 sm:p-12">
            <div className="max-w-2xl">
              <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
                The differentiator
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl">
                Why a browser-based PDF tool is safer than an upload site.
              </h2>
              <p className="mt-3 leading-relaxed text-[var(--color-ink-muted)]">
                When the page does the work, your file never leaves your
                machine. Nothing to leak, nothing to retain, nothing to
                subpoena. We explain how it works — and where the limits are —
                in one read.
              </p>
              <Link
                href="/why-browser-based"
                className="focus-ring mt-6 inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-ink)] px-5 text-base font-medium text-[var(--color-canvas)] transition-opacity hover:opacity-90"
              >
                Read the explainer
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
