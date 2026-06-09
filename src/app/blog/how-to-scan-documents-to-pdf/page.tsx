import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
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

const FAQS: MdxFaq[] = [
  {
    q: "Does the OCR really run in my browser?",
    a: "Yes. Tesseract.js is a JavaScript/WebAssembly port of the Tesseract OCR engine. After a one-time ~3 MB model download, everything happens locally in your browser tab.",
  },
  {
    q: "How long does OCR take?",
    a: "About 5–10 seconds per page on a modern laptop. A long document takes proportionally longer. A progress indicator shows what's happening.",
  },
  {
    q: "Are my files uploaded?",
    a: "No. The scan image, OCR processing, and resulting searchable PDF all stay in your browser. You'll see the model download on first use in DevTools → Network, but no upload of your file.",
  },
  {
    q: "What about handwriting?",
    a: "Tesseract is trained on printed text. Handwriting recognition is hit-or-miss — a dedicated cloud service (Google Vision, AWS Textract) or a handwriting-specific app will outperform browser OCR here.",
  },
  {
    q: "Does it work in different languages?",
    a: "The current tool uses the English model. Multi-language support may be added if there's demand — drop us a line if you need French, Spanish, German, or another language.",
  },
  {
    q: "What DPI should I scan at?",
    a: "300 DPI is the sweet spot for OCR. Higher is overkill and makes files unnecessarily large; lower starts hurting character recognition accuracy, especially for small fonts.",
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
        <UseToolCta toolSlug="/ocr-pdf" />
        <UseToolCta toolSlug="/pdf-to-text" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
