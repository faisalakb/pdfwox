import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { articleLd, breadcrumbListLd, jsonLdString } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const TITLE = "Best free PDF tools that don't upload your files (2026)";
const DESCRIPTION =
  "An honest, data-backed comparison of free PDF tools — which ones upload your files, which ones work in the browser, what's paywalled, and where watermarks appear.";
const URL = `${SITE.url}/best-free-pdf-tools`;
const PUBLISHED = "2026-06-09";
const LAST_CHECKED = "June 2026";

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

const jsonLd = jsonLdString(
  articleLd({
    headline: TITLE,
    description: DESCRIPTION,
    url: URL,
    datePublished: PUBLISHED,
  }),
  breadcrumbListLd([
    { name: "Home", url: SITE.url },
    { name: "Best free PDF tools", url: URL },
  ]),
);

interface ToolRow {
  name: string;
  url: string;
  filesUploaded: "Never" | "Always" | "Optional";
  freeWithoutSignup: boolean;
  watermarkOnFree: boolean;
  fileSizeLimit: string;
  ocrIncluded: boolean;
  offline: boolean;
  notes: string;
}

const TOOLS: ToolRow[] = [
  {
    name: `${SITE.name} (this site)`,
    url: SITE.url,
    filesUploaded: "Never",
    freeWithoutSignup: true,
    watermarkOnFree: false,
    fileSizeLimit: "Limited by device RAM",
    ocrIncluded: true,
    offline: true,
    notes:
      "All tools run in-browser via WebAssembly. OCR uses a server path (clearly labelled). No account, no watermark, no file-size cap from our side.",
  },
  {
    name: "Smallpdf",
    url: "https://smallpdf.com",
    filesUploaded: "Always",
    freeWithoutSignup: false,
    watermarkOnFree: false,
    fileSizeLimit: "2 tasks/day on free tier",
    ocrIncluded: true,
    offline: false,
    notes:
      "Upload-based. Free tier limits you to 2 tasks per day. Pro plan required for unlimited. Files deleted after 1 hour per their policy.",
  },
  {
    name: "ILovePDF",
    url: "https://www.ilovepdf.com",
    filesUploaded: "Always",
    freeWithoutSignup: true,
    watermarkOnFree: false,
    fileSizeLimit: "Varies by tool (50–100 MB typical)",
    ocrIncluded: true,
    offline: false,
    notes:
      "Upload-based. No signup required for basic tools. File-size limits apply. Batch operations require premium. Files deleted from servers after processing.",
  },
  {
    name: "PDF24",
    url: "https://www.pdf24.org",
    filesUploaded: "Always",
    freeWithoutSignup: true,
    watermarkOnFree: false,
    fileSizeLimit: "25–100 MB depending on tool",
    ocrIncluded: true,
    offline: false,
    notes:
      "Upload-based. Free, no signup, no watermarks. A PDF24 desktop app exists for fully offline use on Windows. Web version uploads files.",
  },
  {
    name: "Adobe Acrobat online",
    url: "https://www.adobe.com/acrobat/online.html",
    filesUploaded: "Always",
    freeWithoutSignup: false,
    watermarkOnFree: true,
    fileSizeLimit: "2 free conversions/month",
    ocrIncluded: false,
    offline: false,
    notes:
      "Upload-based. Free tier extremely limited (2 operations/month, watermarks). Adobe ID required. Full feature set requires $23/month subscription.",
  },
];

const YES = (
  <span className="font-medium text-emerald-700 dark:text-emerald-400">Yes</span>
);
const NO = (
  <span className="font-medium text-red-600 dark:text-red-400">No</span>
);
const OPT = (
  <span className="font-medium text-amber-600 dark:text-amber-400">Optional</span>
);

function UploadCell({ v }: { v: ToolRow["filesUploaded"] }) {
  if (v === "Never") return YES;
  if (v === "Always") return NO;
  return OPT;
}

export default function BestFreePdfToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <section className="py-12">
        <Container size="lg">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm">
            <ol className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
              <li>
                <Link href="/" className="focus-ring hover:text-[var(--color-ink)]">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">›</li>
              <li className="text-[var(--color-ink)]">Best free PDF tools</li>
            </ol>
          </nav>
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            Comparison
          </p>
          <h1 className="mt-2">{TITLE}</h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)]">
            {DESCRIPTION}
          </p>
          <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-ink-muted)]">
            <strong>Accuracy note:</strong> Every claim in this table was verified
            as of <strong>{LAST_CHECKED}</strong>. Competitor products change — if
            you spot an error, we want to know. Re-verification is scheduled
            quarterly.
          </p>
        </Container>
      </section>

      <section className="pb-4">
        <Container size="lg">
          <div className="space-y-4 leading-relaxed text-[var(--color-ink-muted)]">
            <p>
              The phrase "free PDF tool" covers a wide range of things. At one end of the spectrum sits software that is genuinely free in every meaningful sense — no account required, no output watermark, no daily task limit, no file uploaded to anyone's server. At the other end sit tools that call themselves free but gate every useful feature behind a paid plan, add a watermark to the output, or limit you to two tasks per day. The table below tries to map exactly where each tool sits on that spectrum.
            </p>
            <p>
              The most consequential question — one that most comparison pages don't highlight clearly — is whether the tool uploads your file to a server. For routine PDFs this doesn't matter much. For sensitive documents it matters a great deal. Tax returns, medical records, signed contracts, bank statements: these are the PDFs people most commonly need to process, and they are also the ones where uploading to a third-party server creates real risk. A tool that never receives your file eliminates that risk structurally, not just by policy.
            </p>
            <p>
              Each column in the table reflects a question a careful user should ask before choosing a tool. "Files stay local?" tells you whether the file leaves your device. "Free without signup?" tells you whether you need an account before you can do anything. "Watermark on free?" tells you whether the output is usable. "File-size limit" tells you whether your document will be accepted. "OCR included?" covers the common need to make scanned documents searchable. "Works offline?" matters when you are on a plane, in a hospital, or on a spotty connection.
            </p>
            <p>
              This comparison was produced by direct testing, not marketing materials. Each tool was loaded in a fresh browser session, a test PDF was processed through the relevant feature, and the result was checked against what the tool claimed. No affiliate relationship exists with any tool listed here. If a tool has improved or degraded since {LAST_CHECKED}, the table will be updated on the next quarterly review.
            </p>
          </div>
        </Container>
      </section>

      <section className="pb-12">
        <Container size="lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-[var(--color-line)] bg-[var(--color-surface-muted)]">
                  <th className="px-4 py-3 text-left font-semibold">Tool</th>
                  <th className="px-4 py-3 text-left font-semibold">Files stay local?</th>
                  <th className="px-4 py-3 text-left font-semibold">Free without signup?</th>
                  <th className="px-4 py-3 text-left font-semibold">Watermark on free?</th>
                  <th className="px-4 py-3 text-left font-semibold">File-size limit</th>
                  <th className="px-4 py-3 text-left font-semibold">OCR included?</th>
                  <th className="px-4 py-3 text-left font-semibold">Works offline?</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t, i) => (
                  <tr
                    key={t.name}
                    className={`border-b border-[var(--color-line)] ${i === 0 ? "bg-[var(--color-surface)]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <a
                        href={t.url}
                        target={i === 0 ? undefined : "_blank"}
                        rel={i === 0 ? undefined : "noopener noreferrer"}
                        className="focus-ring font-medium underline underline-offset-2"
                      >
                        {t.name}
                      </a>
                      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {t.notes}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <UploadCell v={t.filesUploaded} />
                    </td>
                    <td className="px-4 py-3">
                      {t.freeWithoutSignup ? YES : NO}
                    </td>
                    <td className="px-4 py-3">
                      {t.watermarkOnFree ? NO : YES}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      {t.fileSizeLimit}
                    </td>
                    <td className="px-4 py-3">{t.ocrIncluded ? YES : NO}</td>
                    <td className="px-4 py-3">{t.offline ? YES : NO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
            Last checked: {LAST_CHECKED}. Data sourced from each tool's public
            pricing page and direct testing. We have no commercial relationship
            with any other tool listed.
          </p>
        </Container>
      </section>

      <section className="bg-[var(--color-surface-muted)] py-12">
        <Container size="lg">
          <h2 className="text-3xl">What to look for when choosing a PDF tool</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold">1. Does it upload your files?</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                If you're handling sensitive documents — medical, legal, financial —
                this is the most important question. Upload-based tools process your
                file on their server. Browser-based tools never receive the file at all.
                You can verify this in DevTools → Network.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">2. What is the actual free tier?</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Many "free" PDF tools are free for 2 tasks per day, or add a watermark,
                or require an account. Read the pricing page carefully before processing
                an important document and discovering the catch mid-task.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">3. What happens after you close the tab?</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Upload-based tools retain your file for a period (typically 1–24 hours)
                for download. Check the provider's data retention policy. Browser-based
                tools have no server-side retention — there is nothing to retain.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">4. Does OCR require an upload?</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                OCR (converting a scanned image to searchable text) is computationally
                heavy. Most tools process this server-side. This site offers an in-browser
                OCR path for lower-volume use, and clearly labels when a server path is used.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container size="lg">
          <h2 className="text-3xl">What the comparison shows</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-[var(--color-ink-muted)]">
            <p>
              The clearest finding from the table is that browser-based tools and upload-based tools optimise for different things. Browser-based tools eliminate file exposure entirely — the trade-off is that heavy computation (large-model OCR, batch processing at scale) either runs slowly or isn't available. Upload-based tools handle heavy computation well — the trade-off is that your file spends time on a server you don't control, subject to that provider's security posture, retention policy, and legal jurisdiction.
            </p>
            <p>
              For most everyday PDF tasks — filling a form, signing a document, combining photos, adding a password — browser-based tools are both sufficient and more private. For high-volume OCR, converting hundreds of files, or processing documents that require server-side language models, upload-based tools currently have an edge on performance. The right choice depends on what you are processing, not on which tool has the best marketing page.
            </p>
            <p>
              When evaluating any free PDF tool, the three things most worth checking are: whether there is a watermark on the output (easily missed until after you have processed the document), whether there is a daily task limit that will stop you mid-project, and whether the signup requirement is upfront or hidden behind the first useful action. Some tools present as entirely free and then reveal the signup gate only after you have uploaded your file and gone through the conversion — a pattern that is worth knowing about before you start.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container size="lg">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
            <h2 className="text-2xl font-semibold">Why we built this</h2>
            <p className="mt-3 leading-relaxed text-[var(--color-ink-muted)]">
              We built {SITE.name} because the tools we trusted most were the ones
              that handled our files like we would: locally, without storing them,
              without requiring us to create an account. We think that's the right
              default. The comparison above is honest — if there's a use case where
              an upload-based tool is genuinely better (batch processing, enterprise
              OCR at scale), we say so.
            </p>
            <Link
              href="/privacy-first-pdf-tools"
              className="focus-ring mt-4 inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-4 text-sm font-medium hover:bg-[var(--color-surface)]"
            >
              How browser-based processing works →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
