import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-make-a-pdf-fillable")!;

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
    id: "what-fillable-actually-means",
    text: "What 'fillable' actually means",
    depth: 2 as const,
  },
  {
    id: "how-to-make-a-pdf-fillable-in-your-browser",
    text: "How to make a PDF fillable in your browser",
    depth: 2 as const,
  },
  {
    id: "tips-for-fields-that-dont-fight-you-later",
    text: "Tips for fields that don't fight you later",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "when-to-just-type-on-top-instead",
    text: "When to just type on top instead",
    depth: 2 as const,
  },
];

const FAQS: MdxFaq[] = [
  {
    q: "Do I need Adobe Acrobat to create a fillable PDF?",
    a: "No. Acrobat does it well but costs $20/month. Browser-based tools generate the same AcroForm structure the PDF spec defines, so the result is fully compatible with every reader Acrobat is.",
  },
  {
    q: "Can I make a scanned PDF fillable?",
    a: "Yes. You draw rectangles where fields should go — the underlying page doesn't need to be selectable text for the fields to function. If you also need the page text to be searchable, run OCR PDF first.",
  },
  {
    q: "Will the form fields work on a phone?",
    a: "Yes. AcroForm fields work in mobile PDF readers — iOS Files, Android PDF Viewer, Adobe Reader Mobile. Test on the device your recipients are most likely to use.",
  },
  {
    q: "Is my PDF uploaded anywhere?",
    a: "No. The entire tool runs in your browser using WebAssembly. The PDF never crosses the network. Your fields, names, and the saved file are all on your device.",
  },
  {
    q: "What if I make a mistake while placing a field?",
    a: "Use the '×' next to the field in the side panel to remove it, then draw a new rectangle in the right spot.",
  },
  {
    q: "Can I add a real signature field?",
    a: "The current tool adds a signature placeholder — a rectangle where the recipient draws or types their signature. Cryptographically signed PDFs (the kind banks require) are a different mechanism added in a later release.",
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
        <UseToolCta toolSlug="/create-fillable-pdf" />
        <UseToolCta toolSlug="/fill-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
