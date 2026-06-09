import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-scan-documents-to-pdf")!;

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
    id: "the-two-stages-made-explicit",
    text: "The two stages, made explicit",
    depth: 2 as const,
  },
  {
    id: "capture-phone-or-scanner",
    text: "Capture: phone or scanner?",
    depth: 2 as const,
  },
  {
    id: "from-captured-images-to-a-pdf",
    text: "From captured images to a PDF",
    depth: 2 as const,
  },
  {
    id: "ocr-making-the-text-searchable",
    text: "OCR: making the text searchable",
    depth: 2 as const,
  },
  { id: "tips-for-better-ocr", text: "Tips for better OCR", depth: 2 as const },
  {
    id: "when-ocr-isnt-enough",
    text: "When OCR isn't enough",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "the-shortest-version",
    text: "The shortest version",
    depth: 2 as const,
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
    >
      <Content />
      <Container size="sm" className="px-0">
        <UseToolCta toolSlug="/ocr-pdf" />
        <UseToolCta toolSlug="/pdf-to-text" />
      </Container>
    </MdxLayout>
  );
}
