import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Changelog",
  description: `What's new on ${SITE.name} — new tools, improvements, and fixes, in reverse-chronological order.`,
  alternates: { canonical: `${SITE.url}/changelog` },
};

interface ChangelogEntry {
  date: string;
  tag: "New" | "Improvement" | "Fix" | "Content";
  title: string;
  body: string;
  link?: { href: string; label: string };
}

const TAG_STYLES: Record<ChangelogEntry["tag"], string> = {
  New: "bg-[var(--color-accent)] text-white",
  Improvement: "bg-emerald-600 text-white",
  Fix: "bg-amber-500 text-white",
  Content: "bg-sky-600 text-white",
};

const ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-06-09",
    tag: "New",
    title: "Privacy-first PDF tools reference page",
    body: "Published a technical explainer on how browser-based PDF processing works: what happens to your bytes, how to verify no upload occurs, and an honest comparison with upload-based alternatives.",
    link: { href: "/privacy-first-pdf-tools", label: "Read the reference" },
  },
  {
    date: "2026-06-09",
    tag: "New",
    title: "Embeddable PDF tool widget",
    body: "Any tool on this site can now be embedded on external pages via a lightweight iframe. The embed includes a 'Powered by' attribution link and postMessage-based auto-resize. Files still never leave the visitor's device.",
    link: { href: "/fill-pdf", label: "Try embed on Fill PDF" },
  },
  {
    date: "2026-06-09",
    tag: "Content",
    title: "Comparison: best free PDF tools that don't upload your files",
    body: "Published an accurate, dated comparison table covering the main free PDF tools — upload requirements, watermarks, file-size limits, and OCR availability. Re-verified quarterly.",
    link: { href: "/best-free-pdf-tools", label: "View comparison" },
  },
  {
    date: "2026-06-09",
    tag: "Improvement",
    title: "Social card images for all tools and guides",
    body: "Every tool page and how-to guide now generates a branded 1200×630 Open Graph image at build time. Social shares show the tool name and tagline on a consistent branded card.",
  },
  {
    date: "2026-06-09",
    tag: "Improvement",
    title: "Core Web Vitals: CLS fix for PDF preview",
    body: "The PDF preview canvas now shows an A4-ratio skeleton placeholder while the first render is loading, eliminating the layout shift (CLS) that occurred when the canvas jumped from 0×0 to full size.",
  },
  {
    date: "2026-06-09",
    tag: "Improvement",
    title: "Worker pre-warming on tool page load",
    body: "The PDF WebAssembly worker now warms up in the background as soon as a tool page mounts. This removes the cold-start latency from the first file interaction (INP improvement).",
  },
  {
    date: "2026-06-09",
    tag: "Improvement",
    title: "Mobile navigation",
    body: "Added a hamburger menu and full-screen drawer to the site header for mobile viewports (<768 px). All tool categories and static links are now accessible on small screens.",
  },
  {
    date: "2026-06-09",
    tag: "Improvement",
    title: "Sitemap: all 14 guides now indexed",
    body: "Fixed a gap where 5 guides were absent from sitemap.xml. All 14 how-to guides are now included via the guides registry, making them discoverable by search crawlers.",
  },
  {
    date: "2026-06-09",
    tag: "Content",
    title: "9 new how-to guides with FAQ sections",
    body: "Published guides for: Add Signature, Add Watermark, Annotate, Make Fillable, Redact, Remove Password, Remove Watermark, Scan to PDF, and iPhone Photos to PDF. Each includes a 6-question FAQ block and cross-links to related guides.",
  },
  {
    date: "2026-06-07",
    tag: "Content",
    title: "Blog launch: 5 how-to guides",
    body: "Launched the guides section with 5 initial posts: Make Fillable PDF, Turn iPhone Photos into PDF, Scan Documents to PDF, Add Signature to PDF, and Annotate a PDF. All include tool CTAs and related-guide clusters.",
    link: { href: "/blog", label: "View all guides" },
  },
  {
    date: "2026-06-07",
    tag: "New",
    title: "Image-to-PDF converters (6 tools)",
    body: "Added HEIC to PDF, JPG to PDF, PNG to PDF, WebP to PDF, BMP to PDF, and GIF to PDF. All run in-browser — no upload, no signup. HEIC conversion handles iPhone photos natively.",
    link: { href: "/#convert", label: "See converters" },
  },
  {
    date: "2026-06-05",
    tag: "New",
    title: "OCR PDF and PDF to Text tools",
    body: "Two new text-extraction tools: OCR PDF makes scanned documents searchable, and PDF to Text extracts plain text for copying or editing. OCR uses an optional server path for best quality (clearly labelled).",
    link: { href: "/ocr-pdf", label: "Try OCR PDF" },
  },
  {
    date: "2026-06-03",
    tag: "New",
    title: "Watermark tools",
    body: "Add Watermark to PDF lets you stamp text or an image watermark across every page. Remove Watermark from PDF removes a detected watermark layer — both run entirely in-browser.",
  },
  {
    date: "2026-06-01",
    tag: "New",
    title: "Site launch — Wave 1 tools",
    body: "Initial launch with 6 tools: Fill PDF, Create Fillable PDF, Sign PDF, Annotate PDF, Redact PDF, Protect PDF, and Unlock PDF. All client-side, no upload, no signup.",
    link: { href: "/", label: "View all tools" },
  },
];

export default function ChangelogPage() {
  return (
    <>
      <section className="py-12">
        <Container size="md">
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            What's new
          </p>
          <h1 className="mt-2">Changelog</h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)]">
            New tools, improvements, and fixes — in reverse-chronological order.
          </p>
          <p className="mt-3 leading-relaxed text-[var(--color-ink-muted)]">
            PDFWox launches tools in waves. Wave 1 covered the core everyday
            tasks: filling PDF forms, creating fillable PDFs, signing,
            protecting with a password, and unlocking. Wave 2 added editing
            tools — redaction, annotation, and watermarking. Wave 3 brought
            image-to-PDF converters for every common format, plus OCR and
            text extraction. Each entry below links to the relevant tool or
            page where applicable.
          </p>
        </Container>
      </section>

      <section className="pb-20">
        <Container size="md">
          <div className="relative border-l border-[var(--color-line)] pl-8">
            {ENTRIES.map((entry, i) => (
              <div key={i} className="mb-10 last:mb-0">
                {/* Timeline dot */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-canvas)] bg-[var(--color-accent)]"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <time
                    dateTime={entry.date}
                    className="text-sm font-medium text-[var(--color-ink-muted)]"
                  >
                    {entry.date}
                  </time>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TAG_STYLES[entry.tag]}`}
                  >
                    {entry.tag}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-semibold leading-snug">
                  {entry.title}
                </h2>
                <p className="mt-1.5 leading-relaxed text-[var(--color-ink-muted)]">
                  {entry.body}
                </p>
                {entry.link && (
                  <Link
                    href={entry.link.href}
                    className="focus-ring mt-2 inline-flex items-center gap-1 text-sm text-[var(--color-accent)] underline underline-offset-2 hover:opacity-80"
                  >
                    {entry.link.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
