import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { articleLd, faqPageLd, jsonLdString } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const TITLE = "Why a browser-based PDF tool is safer than an upload site";
const DESCRIPTION =
  "An honest threat-model comparison of browser-based and upload-based PDF tools. What each architecture actually does, the limits of browser-based, and how to choose.";
const URL = `${SITE.url}/why-browser-based`;
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
    q: "Is browser-based always more private than upload-based?",
    a: "For the files themselves, yes — they never leave your device. For everything else (analytics, error reports), the comparison is the same as any website. We use privacy-friendly analytics with no cookies and no PII, but you're still loading a page; that part is unavoidable.",
  },
  {
    q: "What if I lose internet mid-task — does the tool still work?",
    a: "Yes, once the page has loaded. The PDF processing runs inside your browser tab using WebAssembly. You can pull the network cable after the page finishes loading and the conversion will still complete.",
  },
  {
    q: "What can't a browser-based tool do?",
    a: "OCR at the best quality (large models are too heavy to ship to a browser tab). Operations that need a Linux toolchain we haven't ported. Anything that requires a server-side API key. We're explicit about which tools fall in this category — they're tagged 'Server' on the tool page.",
  },
  {
    q: "How can I verify nothing is uploaded?",
    a: "Open your browser's DevTools, switch to the Network tab, filter for the request type 'Fetch/XHR', and run the conversion. You'll see the page load (one-time) and that's it. No POST to any server with your file.",
  },
  {
    q: "What about the WebAssembly modules themselves — are those backdoored?",
    a: "All the WASM modules we use are open-source and reproducible from their upstream sources. pdf-lib, pdfjs-dist, qpdf-wasm, heic2any — every one of them has its source on GitHub and we ship the upstream build without modification.",
  },
  {
    q: "Why don't all PDF tools work this way?",
    a: "Two reasons. One: it's substantially harder to build. WASM is younger than server-side tools and the libraries needed less mature. Two: the business model. Upload-based tools can sell subscriptions for OCR or batch processing; their pricing depends on users coming back. Browser-based tools have less leverage to gate, which is good for users but harder for operators.",
  },
];

const jsonLd = jsonLdString(
  articleLd({
    headline: TITLE,
    description: DESCRIPTION,
    url: URL,
    datePublished: PUBLISHED,
  }),
  faqPageLd(FAQS),
);

export default function WhyBrowserBasedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <section className="py-12">
        <Container size="md">
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            The differentiator
          </p>
          <h1 className="mt-2">{TITLE}</h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-ink-muted)]">
            Most "free online PDF tools" want you to upload your file to their
            server. Most of the time, that's fine. Sometimes, it isn't. This
            page explains the difference, honestly, including the things
            browser-based tools <em>can't</em> do.
          </p>
        </Container>
      </section>

      <article className="prose-tight pb-16">
        <Container size="md" className="space-y-7 text-[var(--color-ink)]">
          <section>
            <h2 className="text-3xl">Two architectures, three big questions</h2>
            <p className="mt-3 leading-relaxed">
              Every online PDF tool is one of two architectures: it does the
              work on a server somewhere (we'll call this{" "}
              <strong>upload-based</strong>) or it does the work in your browser
              tab (we'll call this <strong>browser-based</strong>). When you
              drag a PDF onto a tool, three things matter: where the file{" "}
              <em>goes</em>, where the file <em>lives</em>, and who can see it
              on the way.
            </p>
            <p className="mt-3 leading-relaxed">
              Upload-based tools send your file across the internet to a server
              you don't control, store it for some amount of time, do the work
              there, send a result back, and (in the best case) delete the
              original. Browser-based tools do all the same work, but inside
              your browser tab, on your own device. The file doesn't travel.
              There's no server-side copy to delete because there's no
              server-side copy.
            </p>
          </section>

          <section>
            <h2 className="text-3xl">When the difference actually matters</h2>
            <p className="mt-3 leading-relaxed">
              Most PDFs aren't sensitive — a vacation receipt, a meme, a
              conference brochure. For those, upload-based and browser-based are
              functionally identical, and the upload-based version might even be
              faster (servers are big computers). But some PDFs are sensitive.
              These are the ones people care about most:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">
              <li>
                <strong>Personal records</strong> — passports, driving licenses,
                medical reports, insurance forms.
              </li>
              <li>
                <strong>Financial records</strong> — bank statements, tax
                returns, payslips, mortgage paperwork.
              </li>
              <li>
                <strong>Legal documents</strong> — contracts under negotiation,
                severance agreements, NDAs.
              </li>
              <li>
                <strong>Work product</strong> — internal memos, drafts, anything
                covered by an NDA you signed.
              </li>
            </ul>
            <p className="mt-3 leading-relaxed">
              For these, "we delete after 1 hour" is a promise you can't verify.
              Browser-based removes the question: the file never arrives
              anywhere it could be retained.
            </p>
          </section>

          <section>
            <h2 className="text-3xl">The threat model, honestly</h2>
            <p className="mt-3 leading-relaxed">
              Browser-based isn't a silver bullet. It rules out one specific
              class of threat — a third party gaining access to a server with
              your file on it. There are threats it doesn't help with:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">
              <li>
                Your own device is compromised. If something malicious is
                already running on your laptop, no web tool — browser-based or
                upload-based — can save you.
              </li>
              <li>
                Browser extensions you've installed. An extension with broad
                permissions can see what's in your tab, including the bytes of
                the PDF you just dropped. Audit your extensions periodically.
              </li>
              <li>
                The recipient of the result. If you protect a PDF in your
                browser and then email it to someone, your privacy promise ends
                at the send button. The recipient handles it however they handle
                it.
              </li>
            </ul>
            <p className="mt-3 leading-relaxed">
              What browser-based gives you is one fewer hop in the chain — the
              server you'd otherwise be sending the file to. For a lot of
              people, that hop is the riskiest one.
            </p>
          </section>

          <section>
            <h2 className="text-3xl">A side-by-side comparison</h2>
            <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-line)]">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">Question</th>
                    <th className="px-4 py-3 font-medium">Browser-based</th>
                    <th className="px-4 py-3 font-medium">Upload-based</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  <tr>
                    <td className="px-4 py-3">
                      Does your PDF leave your device?
                    </td>
                    <td className="px-4 py-3 text-[var(--color-accent)]">No</td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Yes
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Server retention to trust?</td>
                    <td className="px-4 py-3 text-[var(--color-accent)]">
                      None (no server)
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Their stated policy
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Works offline?</td>
                    <td className="px-4 py-3 text-[var(--color-accent)]">
                      Yes (after load)
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      No
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      Speed for large files (50 MB+)
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Depends on your device
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Depends on their server
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Best for OCR?</td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Light only
                    </td>
                    <td className="px-4 py-3 text-[var(--color-accent)]">
                      Yes (heavy models)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      Best for batch (hundreds of files)?
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Slower
                    </td>
                    <td className="px-4 py-3 text-[var(--color-accent)]">
                      Faster
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Subscription or signup gate?</td>
                    <td className="px-4 py-3 text-[var(--color-accent)]">
                      Rare
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      Common
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              No architecture wins every row. Browser-based is better for
              everyday and sensitive PDFs; upload-based is better for OCR-heavy
              or batch workflows. Both are fine for vacation receipts.
            </p>
          </section>

          <section>
            <h2 className="text-3xl">What "in your browser" really means</h2>
            <p className="mt-3 leading-relaxed">
              The browser tab you're reading this in is a small, well-sandboxed
              computer. It has its own memory, can run compiled WebAssembly
              modules at near-native speed, and can read and write files that
              you choose to share with it. When you drop a PDF onto a
              browser-based tool, the tool's JavaScript reads the bytes from the
              file picker, hands them to a WebAssembly library compiled from a
              real PDF processing toolkit (in our case, libraries like pdf-lib,
              pdfjs-dist, qpdf-wasm), gets a new set of bytes back, and shows
              you a download link.
            </p>
            <p className="mt-3 leading-relaxed">
              No network call carrying your file. No server logs noting that you
              visited at 2am with a PDF named <code>divorce-draft-v3.pdf</code>.
              No retention policy to read. Just bytes in, bytes out, all on your
              device.
            </p>
            <p className="mt-3 leading-relaxed">
              You can verify this yourself. Open DevTools → Network, filter by
              "Fetch/XHR", drop your file, and run the conversion. You'll see
              the page resources load once at the start and nothing else.
            </p>
          </section>

          <section>
            <h2 className="text-3xl">Where browser-based has real limits</h2>
            <p className="mt-3 leading-relaxed">
              We'd rather tell you about the rough edges than have you discover
              them mid-task:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">
              <li>
                <strong>OCR quality.</strong> The best OCR systems use models
                that are gigabytes in size. We won't ship a gigabyte to your
                browser tab. For high-stakes OCR, our future server-side OCR
                will outperform anything in-browser.
              </li>
              <li>
                <strong>Truly huge files.</strong> A 500 MB PDF will exhaust
                browser memory before it finishes. Server-side tools running on
                machines with 64 GB of RAM don't have that problem.
              </li>
              <li>
                <strong>Old browsers.</strong> WebAssembly works in every modern
                browser (last ~5 years). If you're on something older,
                browser-based tools may not run; upload-based ones will.
              </li>
              <li>
                <strong>Mobile data.</strong> The page is bigger than an
                upload-based equivalent because the processing libraries ship
                with it. On a slow mobile connection, the first load can feel
                slow. After that, you're set.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl">How to choose</h2>
            <p className="mt-3 leading-relaxed">
              For sensitive PDFs and everyday tasks (merging, signing, filling,
              redacting, watermarking, password-protecting): pick browser-based.
              For OCR-heavy or batch jobs on non-sensitive files: upload-based
              is fine. For anything in between, ask yourself: would you be
              comfortable if a stranger read this specific PDF? If no, go
              browser-based.
            </p>
            <p className="mt-3 leading-relaxed">
              If you'd like to try ours, every tool in our toolkit is
              browser-based. Start with{" "}
              <Link
                href="/"
                className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
              >
                the homepage
              </Link>
              , pick the tool you need, and drag your file onto the page. No
              signup, no upload, no subscription. The page does the work.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-3xl">Frequently asked questions</h2>
            <div className="mt-6">
              <Accordion items={FAQS.map((f) => ({ q: f.q, a: f.a }))} />
            </div>
          </section>

          <Card className="mt-10">
            <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
              Linkable
            </p>
            <h2 className="font-display mt-1 text-2xl">
              We wrote this so others can link to it
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              If you're writing about privacy, browser-based architecture, or
              PDF tooling, feel free to link to this page. The canonical URL is{" "}
              <code className="text-[var(--color-ink)]">{URL}</code>. No
              tracking parameters required.
            </p>
          </Card>
        </Container>
      </article>
    </>
  );
}
