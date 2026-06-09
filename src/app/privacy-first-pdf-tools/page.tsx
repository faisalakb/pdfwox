import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import {
  articleLd,
  breadcrumbListLd,
  faqPageLd,
  jsonLdString,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const TITLE = "Privacy-first PDF tools: how browser-based processing works";
const DESCRIPTION =
  "A plain-language technical reference: what happens to your PDF bytes when you use a browser-based tool, why no upload means no leak, and where the limits are.";
const URL = `${SITE.url}/privacy-first-pdf-tools`;
const PUBLISHED = "2026-06-09";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "article",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    publishedTime: PUBLISHED,
  },
};

const FAQS = [
  {
    q: "What does 'files never leave your device' actually mean?",
    a: "When you open a PDF in a browser-based tool, the browser's File API reads the bytes directly from your disk into an in-memory ArrayBuffer. That buffer is passed to a WebAssembly module running inside the same browser tab. Nothing in that path involves a network request — the bytes never touch a network socket. You can confirm this by opening DevTools → Network and filtering for Fetch/XHR; you'll see the page assets load once, then nothing.",
  },
  {
    q: "How is this different from a tool like Smallpdf or ILovePDF?",
    a: "Upload-based tools receive your file on their server, process it, then return the result. Your file exists on a third-party machine during processing — subject to their retention policy, security posture, and legal jurisdiction. Browser-based tools never send the file, so there is no server-side exposure window.",
  },
  {
    q: "Can I verify that nothing is uploaded?",
    a: "Yes. Open your browser's DevTools (F12), switch to the Network tab, set the filter to Fetch/XHR or All, then run a conversion. You'll see the initial page assets load. After that, the only network traffic should be analytics events (if any) — never a POST containing your file's contents.",
  },
  {
    q: "What about the WebAssembly modules — could they phone home?",
    a: "WASM modules run inside the browser's sandbox and are subject to the same Same-Origin Policy as any other script. A WASM module cannot open a TCP socket directly; it can only make network calls through the browser's fetch/XHR APIs, which appear in DevTools. Every WASM library this site uses is open-source (pdf-lib, pdfjs-dist, qpdf-wasm, heic2any) and can be audited.",
  },
  {
    q: "Are there any tools on this site that do upload files?",
    a: "The OCR tool optionally uses a server-side OCR engine for best accuracy — it is clearly labelled. When you use it, the file is sent to our server over HTTPS, processed, and deleted immediately. No file is stored, shared, or retained. All other tools on this site are client-side only.",
  },
  {
    q: "What about my internet connection — does the tool still work offline?",
    a: "Yes, once the page has loaded. All processing runs locally in your browser tab using WebAssembly. You can disconnect from the internet after the page finishes loading and the conversion will still complete.",
  },
  {
    q: "Why don't all PDF tools work this way?",
    a: "Two reasons: technical difficulty and business model. WebAssembly-based PDF processing is substantially harder to build than server-side pipelines, and the libraries are younger. Also, upload-based tools can gate features behind subscriptions (e.g., batch processing, OCR at scale) in ways that browser-based tools cannot, making the server model commercially attractive to operators.",
  },
];

const jsonLd = jsonLdString(
  articleLd({
    headline: TITLE,
    description: DESCRIPTION,
    url: URL,
    datePublished: PUBLISHED,
  }),
  breadcrumbListLd([
    { name: "Home", url: SITE.url },
    { name: "Privacy-first PDF tools", url: URL },
  ]),
  faqPageLd(FAQS),
);

const COMPARISON = [
  {
    feature: "Files stay on your device",
    browserBased: "Yes — files never cross the network",
    uploadBased: "No — file sent to a third-party server",
  },
  {
    feature: "Works without an account",
    browserBased: "Yes",
    uploadBased: "Usually no (free tier often requires login)",
  },
  {
    feature: "Works offline after page load",
    browserBased: "Yes",
    uploadBased: "No",
  },
  {
    feature: "File size limits",
    browserBased: "Set by your device's RAM, not our server",
    uploadBased: "Usually 25–50 MB on free tier",
  },
  {
    feature: "Retention risk",
    browserBased: "None — file never stored on a server",
    uploadBased: "Depends on provider's policy (often 1–24 h)",
  },
  {
    feature: "Processing speed",
    browserBased: "Instant for small files; limited by your CPU for large ones",
    uploadBased: "Depends on server load and upload speed",
  },
  {
    feature: "OCR quality at scale",
    browserBased:
      "Good for single docs; large models too heavy for the browser",
    uploadBased: "Better for high-volume OCR (server has more compute)",
  },
  {
    feature: "Verifiable privacy",
    browserBased: "Yes — open DevTools, watch Network tab",
    uploadBased: "No — requires trusting the provider's statement",
  },
];

export default function PrivacyFirstPdfToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <section className="py-12">
        <Container size="md">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <ol className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
              <li>
                <Link href="/" className="focus-ring hover:text-[var(--color-ink)]">Home</Link>
              </li>
              <li aria-hidden="true">›</li>
              <li className="text-[var(--color-ink)]">{TITLE}</li>
            </ol>
          </nav>
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            Technical reference
          </p>
          <h1 className="mt-2">{TITLE}</h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)]">
            {DESCRIPTION}
          </p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Published {PUBLISHED} · Last checked June 2026
          </p>
        </Container>
      </section>

      <section className="pb-8">
        <Container size="md" className="space-y-8 leading-relaxed text-[var(--color-ink)]">

          <div>
            <h2 className="text-3xl">What happens when you open a PDF here</h2>
            <p className="mt-4">
              When you drag a PDF onto one of the tools on this site, the following
              sequence happens entirely inside your browser:
            </p>
            <ol className="mt-4 list-decimal space-y-3 pl-5">
              <li>
                <strong>File picker / drag-and-drop:</strong> The browser's{" "}
                <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 text-sm">File</code>{" "}
                API reads the file from your disk into an in-memory{" "}
                <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 text-sm">ArrayBuffer</code>
                . This is local I/O — no network involved.
              </li>
              <li>
                <strong>WebAssembly processing:</strong> The{" "}
                <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 text-sm">ArrayBuffer</code>{" "}
                is passed to a WebAssembly module (e.g., <em>pdf-lib</em> for form-filling,{" "}
                <em>qpdf-wasm</em> for encryption) running inside your browser tab. WASM modules
                execute in the same sandboxed environment as JavaScript — they cannot open raw TCP
                sockets, write to disk, or access other tabs.
              </li>
              <li>
                <strong>Result construction:</strong> The WASM module returns a modified{" "}
                <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 text-sm">Uint8Array</code>
                . The page constructs a{" "}
                <code className="rounded bg-[var(--color-surface-muted)] px-1 py-0.5 text-sm">Blob URL</code>{" "}
                and triggers a browser download — again, entirely local.
              </li>
            </ol>
            <p className="mt-4">
              At no point does the file's bytes cross a network socket. This is not
              a policy claim — it is a consequence of how the architecture works.
            </p>
          </div>

          <div>
            <h2 className="text-3xl">How to verify this yourself</h2>
            <p className="mt-4">
              You don't need to take our word for it. Here is a repeatable, 60-second
              verification:
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>Open any tool on this site (e.g., <Link href="/fill-pdf" className="focus-ring underline underline-offset-2">Fill PDF</Link>).</li>
              <li>Open DevTools: <kbd className="rounded border border-[var(--color-line)] px-1 py-0.5 text-xs">F12</kbd> on Windows/Linux, <kbd className="rounded border border-[var(--color-line)] px-1 py-0.5 text-xs">⌘⌥I</kbd> on Mac.</li>
              <li>Click the <strong>Network</strong> tab. Set filter to <strong>Fetch/XHR</strong>.</li>
              <li>Drop a PDF onto the page and complete a conversion.</li>
              <li>
                Inspect the Network tab. You'll see the initial page assets. You will
                not see a POST request containing your file.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-3xl">Browser-based vs. upload-based: an honest comparison</h2>
            <p className="mt-4">
              Browser-based is not universally better — each architecture has genuine
              trade-offs. Here is an accurate comparison:
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
                    <th className="px-4 py-3 text-left font-semibold">Feature</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--color-accent)]">Browser-based (this site)</th>
                    <th className="px-4 py-3 text-left font-semibold">Upload-based</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b border-[var(--color-line)]">
                      <td className="px-4 py-3 font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-[var(--color-ink-muted)]">{row.browserBased}</td>
                      <td className="px-4 py-3 text-[var(--color-ink-muted)]">{row.uploadBased}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-3xl">When we do use a server</h2>
            <p className="mt-4">
              One tool on this site uses a server-side component: the{" "}
              <Link href="/ocr-pdf" className="focus-ring underline underline-offset-2">OCR PDF</Link>{" "}
              tool, when server OCR is selected. In that case:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>The file is transmitted over HTTPS to our processing server.</li>
              <li>OCR is run and the result is returned to your browser.</li>
              <li>The file is deleted immediately after the result is returned. We do not store, log, or share it.</li>
              <li>The tool page is clearly labelled so you know before you upload.</li>
            </ul>
            <p className="mt-4">
              All other tools are client-side only. No file ever leaves your browser for those.
            </p>
          </div>

          <div>
            <h2 className="text-3xl">The open-source libraries we use</h2>
            <p className="mt-4">
              Every WebAssembly module we ship comes from an open-source project. You can
              read the source code, review the build process, and confirm we haven't
              modified the binary:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><strong>pdf-lib</strong> — PDF creation and form-filling</li>
              <li><strong>pdfjs-dist</strong> — PDF rendering and text extraction (Mozilla)</li>
              <li><strong>qpdf-wasm</strong> — PDF encryption and password protection</li>
              <li><strong>heic2any</strong> — HEIC/HEIF image decoding</li>
              <li><strong>tesseract.js</strong> — In-browser OCR (client-side path)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-3xl">Frequently asked questions</h2>
            <div className="mt-6">
              <Accordion items={FAQS} />
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-6">
            <h2 className="text-xl font-semibold">Want to go deeper?</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Our companion explainer covers the threat model in more detail — what the
              server actually sees, what browser-based tools can and can't protect against,
              and how to audit a tool you're not sure about.
            </p>
            <Link
              href="/why-browser-based"
              className="focus-ring mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-ink)] px-4 text-sm font-medium text-[var(--color-canvas)] hover:opacity-90"
            >
              Read the threat-model explainer →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
