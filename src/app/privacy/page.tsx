import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const UPDATED = "2026-06-09";

export const metadata: Metadata = {
  title: "Privacy",
  description: `${SITE.name}'s privacy policy — short, honest, no jargon. Most tools never see your files. Here's exactly what we collect and don't.`,
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="py-12">
        <Container size="md">
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            Privacy
          </p>
          <h1 className="mt-2">What we collect (almost nothing)</h1>
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            Last updated: {UPDATED}
          </p>
        </Container>
      </section>

      <section className="pb-16">
        <Container
          size="md"
          className="space-y-6 leading-relaxed text-[var(--color-ink)]"
        >
          <p>
            This page is short on purpose. Most privacy policies hide their
            answers inside legal boilerplate. We'd rather you understand ours in
            two minutes.
          </p>

          <h2 className="pt-4 text-3xl">Your files</h2>
          <p>
            <strong>
              Tools tagged "In-browser" don't see your files at all.
            </strong>{" "}
            When you drag a PDF onto a browser-based tool, the bytes go from the
            file picker straight into a WebAssembly module running in your
            browser tab. Nothing in that path makes a network call with your
            file's contents. You can verify this in DevTools → Network.
          </p>
          <p>
            <strong>
              Tools tagged "Server" (currently none in v1, planned for OCR
              later) will process files on a server and delete them immediately
              after the response.
            </strong>{" "}
            We'll never have a server tool without saying so clearly on the tool
            page, and we'll never quietly switch an in-browser tool to
            server-side processing.
          </p>

          <h2 className="pt-4 text-3xl">Analytics we use</h2>
          <p>
            We use a privacy-friendly analytics service (Plausible or Cloudflare
            Web Analytics, depending on the host). It logs page views without
            cookies, doesn't share data with advertisers, and doesn't
            fingerprint you. From it we learn things like "which tools are
            getting used" and "which page is broken in Firefox"; we don't learn
            who you are.
          </p>
          <p>The specific events we record about tool usage:</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              Tool viewed (just the tool slug, e.g. <code>/fill-pdf</code>).
            </li>
            <li>
              File added (your file's MIME type + a size bucket like "5–25MB" —
              never the file name or contents).
            </li>
            <li>
              Tool started / succeeded / failed (with a duration and, if failed,
              the error reason).
            </li>
            <li>Download clicked.</li>
          </ul>
          <p>
            None of these include your filename, your file's contents, or any
            personal identifier.
          </p>

          <h2 className="pt-4 text-3xl">Errors we track</h2>
          <p>
            If a tool crashes, the JavaScript error message is sent to{" "}
            <a
              href="https://sentry.io"
              className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
              rel="noopener noreferrer"
              target="_blank"
            >
              Sentry
            </a>{" "}
            so we can fix it. The error includes the stack trace, the browser
            version, and the tool slug. It does not include your file or its
            contents.
          </p>

          <h2 className="pt-4 text-3xl">Cookies</h2>
          <p>
            We don't set tracking cookies. Your browser may store a few small
            preferences locally (last-used filename, saved signature shape) —
            these stay on your device and aren't sent anywhere.
          </p>

          <h2 className="pt-4 text-3xl">If you contact us</h2>
          <p>
            Emails to{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
            >
              {SITE.email}
            </a>{" "}
            land in a regular inbox we read. We keep them for as long as it's
            useful to keep them and don't share them with anyone.
          </p>

          <h2 className="pt-4 text-3xl">Changes</h2>
          <p>
            If we change this policy in a way that affects users, we'll update
            the "last updated" date at the top and (for material changes) post a
            note on the homepage for at least a month.
          </p>

          <h2 className="pt-4 text-3xl">Questions</h2>
          <p>
            Email{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
            >
              {SITE.email}
            </a>
            . For the architecture story behind all of this, see{" "}
            <Link
              href="/why-browser-based"
              className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
            >
              Why a browser-based PDF tool is safer than an upload site
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
