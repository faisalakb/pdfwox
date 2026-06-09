import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("pdf-vs-docx-which-to-send")!;

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
    id: "what-each-format-is-actually-for",
    text: "What each format is actually for",
    depth: 2 as const,
  },
  {
    id: "when-pdf-is-the-right-choice",
    text: "When PDF is the right choice",
    depth: 2 as const,
  },
  {
    id: "when-docx-is-the-right-choice",
    text: "When DOCX is the right choice",
    depth: 2 as const,
  },
  {
    id: "when-you-should-send-both",
    text: "When you should send both",
    depth: 2 as const,
  },
  {
    id: "when-pdf-is-the-wrong-choice-and-people-send-it-anyway",
    text: "When PDF is the wrong choice (and people send it anyway)",
    depth: 2 as const,
  },
  {
    id: "when-docx-is-the-wrong-choice-and-people-send-it-anyway",
    text: "When DOCX is the wrong choice (and people send it anyway)",
    depth: 2 as const,
  },
  {
    id: "converting-between-formats",
    text: "Converting between formats",
    depth: 2 as const,
  },
  { id: "in-one-sentence", text: "In one sentence", depth: 2 as const },
];

const FAQS: MdxFaq[] = [
  {
    q: "Is PDF or DOCX better for resumes?",
    a: "PDF for the cover-letter version sent directly to a human (preserves layout). DOCX for any submission that runs through an applicant tracking system (ATS) — those systems handle DOCX more reliably than PDF.",
  },
  {
    q: "Can the recipient edit my PDF?",
    a: "They can add annotations and fill in form fields, but they can't easily rewrite the body text without a PDF editor. That's the point: PDF freezes layout.",
  },
  {
    q: "Does a DOCX I send keep my fonts?",
    a: "Only if the recipient has the same fonts installed. Otherwise Word substitutes, which can shift line breaks and page layout. PDF embeds the fonts so they always look right.",
  },
  {
    q: "Is PDF safer than DOCX?",
    a: "Both formats can carry malware (DOCX macros, PDF JavaScript). Modern viewers sandbox these well. For untrusted documents, scan with antivirus regardless of format.",
  },
  {
    q: "What about Google Docs format?",
    a: "Google Docs are best for real-time collaboration. Export to PDF for distribution; export to DOCX for handing off to a Word user. Sending a Google Doc link assumes the recipient has Google Workspace access.",
  },
  {
    q: "Should I always send PDF for signatures?",
    a: "Yes for ordinary electronic signatures. For high-stakes legal documents requiring cryptographic certificates, the workflow involves PDF signed via a CA-issued certificate, which is a separate setup.",
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
      }}
      headings={HEADINGS}
      faqs={FAQS}
    >
      <Content />
      <Container size="sm" className="px-0">
        <UseToolCta toolSlug="/sign-pdf" />
        <UseToolCta toolSlug="/fill-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
