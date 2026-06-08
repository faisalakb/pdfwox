import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.name} is a small set of free PDF tools that run entirely in your browser. No signup, no upload, no subscription.`,
  alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
  const liveToolCount = tools.filter((t) => t.status === "live").length;
  return (
    <>
      <section className="py-12">
        <Container size="md">
          <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
            About
          </p>
          <h1 className="mt-2">A small set of PDF tools that respect you</h1>
        </Container>
      </section>

      <section className="pb-16">
        <Container
          size="md"
          className="space-y-6 leading-relaxed text-[var(--color-ink)]"
        >
          <p>
            {SITE.name} is a focused toolkit for working with PDFs. Every tool
            runs inside your browser tab — your files never leave your device,
            and we don't ask you to sign up, pay for a subscription, or wait for
            a server queue to clear.
          </p>

          <h2 className="pt-4 text-3xl">What this is</h2>
          <p>
            Currently {liveToolCount} working tools, plus more on the way. The
            toolkit covers the everyday: filling and making PDF forms, turning
            iPhone HEIC photos into a shareable PDF, unlocking a PDF you have
            the password for, protecting one with AES-256, and the wave 2 and 3
            tools — redaction, annotation, watermarking, signatures — ship over
            the coming weeks.
          </p>
          <p>
            None of these are revolutionary on their own. What's different is
            that they all <em>run on your device</em>. There is no upload step,
            no "we delete after 1 hour" promise to take on faith, no account to
            remember the password to.
          </p>

          <h2 className="pt-4 text-3xl">Why it's built this way</h2>
          <p>
            Most online PDF tools work by uploading your file to a server, doing
            the work there, and sending the result back. That model works fine
            for most PDFs. But the PDFs people care about most — tax returns,
            contracts, medical records — are the ones they're least comfortable
            sending to a server they don't control.
          </p>
          <p>
            Browser-based PDF tooling didn't really work until recently. Modern
            WebAssembly lets us run the same C++ libraries (qpdf, libheif,
            pdf-lib's underlying primitives) inside the browser at near-native
            speed. We get to be a real PDF tool without ever touching your file.{" "}
            <Link
              href="/why-browser-based"
              className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
            >
              Why a browser-based PDF tool is safer than an upload site
            </Link>{" "}
            covers the architecture in more depth.
          </p>

          <h2 className="pt-4 text-3xl">What it isn't</h2>
          <p>
            We're not trying to replace Adobe Acrobat. If you do high-volume
            document processing all day, a desktop tool will serve you better.
            If your workflow needs cryptographic signatures with a certificate
            authority, that's outside what a browser tab can do well.
          </p>
          <p>
            What we are: the place you go when you need to do one thing to a
            PDF, quickly, without uploading it or paying for it.
          </p>

          <h2 className="pt-4 text-3xl">How we'll stay free</h2>
          <p>
            For the in-browser tools, "free" is sustainable — we don't pay for a
            server to process your files. If we eventually offer server-side OCR
            or batch processing, those will likely have a paid tier, but the
            existing free tools stay free.
          </p>

          <Card className="mt-8">
            <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
              Get in touch
            </p>
            <h3 className="font-display mt-1 text-lg">
              Feedback, bug reports, requests
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              The fastest way to reach the maker is{" "}
              <a
                href={`mailto:${SITE.email}`}
                className="focus-ring text-[var(--color-accent)] underline underline-offset-2"
              >
                {SITE.email}
              </a>
              . Tell us what tool, what file, and what browser — that's usually
              enough to reproduce anything.
            </p>
          </Card>
        </Container>
      </section>
    </>
  );
}
