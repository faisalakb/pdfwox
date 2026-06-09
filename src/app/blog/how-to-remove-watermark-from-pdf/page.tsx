import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-remove-watermark-from-pdf")!;

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
    id: "three-kinds-of-watermark",
    text: "Three kinds of watermark",
    depth: 2 as const,
  },
  {
    id: "the-90-second-method-for-overlay-text-watermarks",
    text: "The 90-second method for overlay text watermarks",
    depth: 2 as const,
  },
  {
    id: "what-this-approach-cant-do",
    text: "What this approach can't do",
    depth: 2 as const,
  },
  {
    id: "what-you-can-do-for-rasterized-watermarks",
    text: "What you can do for rasterized watermarks",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  { id: "the-short-version", text: "The short version", depth: 2 as const },
];

const FAQS: MdxFaq[] = [
  {
    q: "Why can't browsers just remove any watermark?",
    a: "Because watermarks aren't a uniform feature of the PDF format. They can be text objects, image objects, or part of the page image itself — each requiring different surgery. 'Remove watermark' is an umbrella term hiding three different jobs.",
  },
  {
    q: "Are my files uploaded?",
    a: "No. The scan and the cover step both run in your browser tab. Verifiable in DevTools → Network.",
  },
  {
    q: "Will the recipient know I removed the watermark?",
    a: "The visible page shows no watermark. However, the raw PDF bytes still contain the original text string — anyone running pdftotext on the file can find it. For cryptographic absence (no recovery, ever), use the Redact PDF tool instead.",
  },
  {
    q: "What if my PDF is encrypted and I don't know the password?",
    a: "You can't remove a watermark from an encrypted PDF you can't open. If you have the password, run the Unlock PDF tool first, then remove the watermark.",
  },
  {
    q: "What about watermarks that are images of text (like a graphic that says 'DRAFT')?",
    a: "If the graphic is a separate image object overlaid on the page, it can sometimes be selected and deleted in Adobe Acrobat. Our tool focuses on text-string watermarks; image-overlay support may come in a later release.",
  },
  {
    q: "How can I tell if my watermark is removable before trying?",
    a: "Open the PDF in Adobe Reader and try to select the watermark text with the text cursor. If you can highlight and copy it, it's an overlay text watermark and removable. If nothing selects, it's rasterized into the page and can't be removed by any browser tool.",
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
        <UseToolCta toolSlug="/remove-watermark-from-pdf" />
        <UseToolCta toolSlug="/redact-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
