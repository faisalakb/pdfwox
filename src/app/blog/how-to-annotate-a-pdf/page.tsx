import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-annotate-a-pdf")!;

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
    id: "the-five-annotation-modes-that-cover-almost-everything",
    text: "The five annotation modes that cover almost everything",
    depth: 2 as const,
  },
  {
    id: "the-60-second-method",
    text: "The 60-second method",
    depth: 2 as const,
  },
  {
    id: "highlight-vs-text-vs-rectangle-when-to-use-which",
    text: "Highlight vs. text vs. rectangle: when to use which",
    depth: 2 as const,
  },
  {
    id: "annotations-that-bake-in-vs-annotations-that-dont",
    text: "Annotations that bake in vs. annotations that don't",
    depth: 2 as const,
  },
  {
    id: "tips-that-save-time",
    text: "Tips that save time",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "the-short-version",
    text: "The short version",
    depth: 2 as const,
  },
];

const FAQS: MdxFaq[] = [
  {
    q: "Will my annotations show up in Adobe Reader?",
    a: "Yes. Annotations are drawn into the page content via standard PDF drawing primitives — text, rectangle, ellipse, line. Every PDF reader since Adobe Reader 5 knows how to display these.",
  },
  {
    q: "Can I annotate a scanned PDF?",
    a: "Yes. Scanned PDFs are just image pages from the tool's perspective. You drag annotations on top exactly the same way as on a text-based PDF.",
  },
  {
    q: "Are my annotations searchable?",
    a: "Text annotations are. The text you type becomes part of the page's text content after saving, so a reader's search will find it.",
  },
  {
    q: "Is my file uploaded?",
    a: "No. The annotation editor and the save step run entirely in your browser tab. Verifiable in DevTools → Network.",
  },
  {
    q: "Can I undo an annotation?",
    a: "Delete is per-annotation in the side panel. Drawing a rectangle and then deciding it should have been an ellipse means removing the rectangle and drawing the ellipse — there's no in-place conversion.",
  },
  {
    q: "Can I export annotations only?",
    a: "Not in this tool. The output is always a complete PDF with annotations baked in. For an annotations-only export (e.g. XFDF), that's a separate feature that hasn't landed yet.",
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
        <UseToolCta toolSlug="/annotate-pdf" />
        <UseToolCta toolSlug="/sign-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
