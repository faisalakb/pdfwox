import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-redact-a-pdf")!;

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
    id: "what-redacted-really-means",
    text: "What 'redacted' really means",
    depth: 2 as const,
  },
  {
    id: "the-90-second-method",
    text: "The 90-second method",
    depth: 2 as const,
  },
  {
    id: "how-to-verify-the-redaction-worked",
    text: "How to verify the redaction worked",
    depth: 2 as const,
  },
  {
    id: "tips-for-clean-redactions",
    text: "Tips for clean redactions",
    depth: 2 as const,
  },
  {
    id: "what-cant-be-redacted-cleanly",
    text: "What can't be redacted (cleanly)",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "the-shortest-possible-summary",
    text: "The shortest possible summary",
    depth: 2 as const,
  },
];

const FAQS: MdxFaq[] = [
  {
    q: "Doesn't a black box drawn on top count as redaction?",
    a: "No. A box drawn on top hides text visually but leaves it in the file — still selectable, still copyable, still extractable by any PDF inspector. True redaction replaces the affected page content so the original text is gone from the file entirely.",
  },
  {
    q: "Does this mean every redacted PDF gets bigger?",
    a: "Only on the pages you redacted. Vector text is small; raster images are larger. Expect roughly 100–500 KB of growth per redacted page. For most documents this is acceptable.",
  },
  {
    q: "Does the redaction survive printing?",
    a: "Yes. The redacted page is now a flat image, so what you print is the image — black boxes and all. There's no hidden text layer that could reappear.",
  },
  {
    q: "Is my file uploaded?",
    a: "No. Both the original PDF and the redacted output stay in your browser tab. Verifiable in DevTools → Network.",
  },
  {
    q: "Can I redact a digitally signed PDF?",
    a: "You can redact the visual representation of a signature. The cryptographic signature object itself can't be removed without invalidating the document's signed status — redact a copy and note that the original signature is on the unredacted version.",
  },
  {
    q: "How do I verify the redaction actually worked?",
    a: "Open the output PDF, triple-click inside one of the black boxes to select that line, copy, and paste into a plain-text editor. If the original text appears, the redaction failed — do not send that file.",
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
        <UseToolCta toolSlug="/redact-pdf" />
        <UseToolCta toolSlug="/annotate-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
