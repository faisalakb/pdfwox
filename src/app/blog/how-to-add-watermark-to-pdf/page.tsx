import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-add-watermark-to-pdf")!;

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
    id: "the-five-choices-that-matter",
    text: "The five choices that matter",
    depth: 2 as const,
  },
  {
    id: "the-60-second-method",
    text: "The 60-second method",
    depth: 2 as const,
  },
  {
    id: "choosing-text-content",
    text: "Choosing text content",
    depth: 2 as const,
  },
  {
    id: "choosing-image-content",
    text: "Choosing image content",
    depth: 2 as const,
  },
  {
    id: "tiling-that-does-the-job",
    text: "Tiling that does the job",
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
    q: "Does the watermark survive when the recipient prints?",
    a: "Yes. It's part of the page content, not a reader-side annotation. Whatever they see on screen is what comes out of the printer.",
  },
  {
    q: "Will the watermark prevent the recipient from extracting text underneath?",
    a: "No. The watermark is drawn on top; the underlying text is unchanged. If you need to truly hide content, use the Redact PDF tool — that genuinely removes content rather than covering it.",
  },
  {
    q: "Are my files uploaded?",
    a: "No. The watermarking happens entirely in your browser tab using pdf-lib running on WebAssembly. Verifiable in DevTools → Network.",
  },
  {
    q: "Can the recipient remove the watermark?",
    a: "If the watermark is text and they have the right tool, sometimes yes. Combining rotation, tiling, and overlap with page content makes automatic removal much less reliable.",
  },
  {
    q: "Can I have a different watermark on each page?",
    a: "The current tool applies one watermark configuration per save. To have different watermarks per page, save once with the first watermark on a specific range, then re-open the result and watermark a different page range.",
  },
  {
    q: "Can I use a custom font?",
    a: "Currently the tool uses Helvetica — the standard sans-serif font baked into every PDF reader. Custom fonts will be added when there is clear demand.",
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
        <UseToolCta toolSlug="/add-watermark-to-pdf" />
        <UseToolCta toolSlug="/remove-watermark-from-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
