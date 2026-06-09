import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-extract-images-from-a-pdf")!;

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
    id: "the-three-reliable-methods",
    text: "The three reliable methods",
    depth: 2 as const,
  },
  {
    id: "when-extract-images-is-the-wrong-question",
    text: "When 'extract images' is the wrong question",
    depth: 2 as const,
  },
  {
    id: "what-about-copyright",
    text: "What about copyright?",
    depth: 2 as const,
  },
  {
    id: "tips-for-cleaner-extraction",
    text: "Tips for cleaner extraction",
    depth: 2 as const,
  },
  { id: "in-one-sentence", text: "In one sentence", depth: 2 as const },
];

const FAQS: MdxFaq[] = [
  {
    q: "Can I extract images from a password-protected PDF?",
    a: "Only after you've unlocked it. If you have the password, use the Unlock PDF tool first, then extract.",
  },
  {
    q: "What's the difference between extracting images and converting PDF to JPG?",
    a: "Extraction pulls the embedded image objects out at their original resolution. PDF-to-JPG renders each whole page as a JPG, including the surrounding text and layout.",
  },
  {
    q: "Will the extracted image be the same quality as the original source?",
    a: "Usually yes, if the PDF was made with the original-resolution images embedded. If the PDF was produced by 'Print to PDF' from a webpage, the images may already have been recompressed.",
  },
  {
    q: "How do I extract just one image, not all of them?",
    a: "Screenshot the region. It's the fastest method for a single image and gives you the same visual result.",
  },
  {
    q: "Can I extract vector graphics (SVG-style) from a PDF?",
    a: "PDFs store vector graphics as path operators inside the page content stream, not as separate objects. Extracting vectors cleanly requires a desktop tool like Illustrator or Inkscape — browser extractors typically handle only embedded raster images.",
  },
  {
    q: "What if the PDF is a scan — does it have 'images' to extract?",
    a: "Yes — each page is a single embedded image. Extracting it pulls that page-sized image out. If you want a region inside the scan, screenshot or crop after extraction.",
  },
  {
    q: "Are extracted images watermarked?",
    a: "Whatever was visible on the page is in the extracted image, including watermarks. The Remove Watermark tool can help if it's an overlay; raster watermarks survive extraction.",
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
        <UseToolCta toolSlug="/pdf-to-text" />
        <UseToolCta toolSlug="/ocr-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
