import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-remove-password-from-pdf")!;

export const metadata: Metadata = {
  title: GUIDE.title,
  description: GUIDE.description,
  alternates: { canonical: `${SITE.url}/blog/${GUIDE.slug}` },
  openGraph: {
    title: GUIDE.title,
    description: GUIDE.description,
    type: "article",
    publishedTime: GUIDE.datePublished,
    url: `${SITE.url}/blog/${GUIDE.slug}`,
  },
};

const HEADINGS = [
  {
    id: "what-remove-a-password-really-means",
    text: "What 'remove a password' really means",
    depth: 2 as const,
  },
  {
    id: "the-90-second-method",
    text: "The 90-second method",
    depth: 2 as const,
  },
  {
    id: "what-this-can-and-cant-do",
    text: "What this can and can't do",
    depth: 2 as const,
  },
  {
    id: "why-files-stay-private-matters-here",
    text: "Why 'files stay private' matters here",
    depth: 2 as const,
  },
  {
    id: "putting-a-password-back-on",
    text: "Putting a password back on",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "the-honest-summary",
    text: "The honest summary",
    depth: 2 as const,
  },
];

const FAQS: MdxFaq[] = [
  {
    q: "Can you crack a forgotten PDF password?",
    a: "No. Nobody can in a reasonable amount of time with sensible passwords. Modern PDFs use AES-256. Tools that promise otherwise are either running a guess list of common passwords (which only works if yours is on it) or harvesting your file.",
  },
  {
    q: "Is my password sent anywhere when I unlock?",
    a: "No. The password is typed into the page and used by the in-browser WebAssembly module. There is no network call carrying it — verifiable in DevTools → Network.",
  },
  {
    q: "Will the unlocked output look exactly the same?",
    a: "Yes. Page content, fonts, embedded images, form fields, and signatures are all unchanged. The only thing removed is the encryption envelope.",
  },
  {
    q: "Do you keep my file?",
    a: "No. There's nothing to keep — your file is never uploaded. The decryption runs entirely in your browser tab.",
  },
  {
    q: "What if I lost the password to a document I own?",
    a: "If you have the PDF open somewhere (Acrobat, Preview), re-save it without a password from that app. If you don't have a copy open anywhere and don't know the password, the document is, for practical purposes, gone.",
  },
  {
    q: "What's the difference between a user password and an owner password?",
    a: "A user password (open password) prevents anyone from viewing the file without typing it. An owner password controls restrictions like 'can't print' or 'can't copy text' — the file opens without it, but readers enforce those limits. This tool removes both.",
  },
];

export default function GuidePage() {
  return (
    <MdxLayout
      meta={{
        title: GUIDE.title,
        description: GUIDE.description,
        slug: GUIDE.slug,
        datePublished: GUIDE.datePublished,
        toolSlug: GUIDE.toolSlug,
      }}
      headings={HEADINGS}
      faqs={FAQS}
    >
      <Content />
      <Container size="sm" className="px-0">
        <UseToolCta toolSlug="/unlock-pdf" />
        <UseToolCta toolSlug="/protect-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
