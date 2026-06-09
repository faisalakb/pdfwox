import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-rotate-pages-in-a-pdf")!;

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
    id: "two-kinds-of-rotation-only-one-is-useful",
    text: "Two kinds of rotation, only one is useful",
    depth: 2 as const,
  },
  {
    id: "the-60-second-method",
    text: "The 60-second method",
    depth: 2 as const,
  },
  {
    id: "when-rotation-isnt-the-answer",
    text: "When rotation isn't the answer",
    depth: 2 as const,
  },
  {
    id: "when-youd-want-to-rotate-every-page",
    text: "When you'd want to rotate every page",
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
    q: "Why doesn't rotation in Adobe Reader save?",
    a: "Adobe Reader's rotate-view button changes how you see the page, not the file. Save the file, reopen it, and the rotation is gone. You need a tool that bakes the rotation into the page content.",
  },
  {
    q: "Can I rotate just one page out of many?",
    a: "Yes — re-export that page as an image, rotate it, then rebuild the PDF with the rotated image in the right slot using JPG to PDF. Approach 1 in the guide covers this.",
  },
  {
    q: "Does rotation affect file size?",
    a: "Slightly. Embedded rotation adds a small amount of metadata. If you rebuild via image conversion, the file size depends on the image format and compression.",
  },
  {
    q: "Will the recipient see the rotation in any PDF reader?",
    a: "Yes — embedded rotation (the kind our suggested approach produces) appears the same in every reader, on every platform, including print.",
  },
  {
    q: "What about EXIF orientation on the source images?",
    a: "Different image tools handle EXIF orientation differently. To be safe, view each source image after rotating to confirm it actually rotated (not just had its orientation metadata changed).",
  },
  {
    q: "When will the dedicated Rotate PDF tool ship?",
    a: "It's on the roadmap. The two approaches in this guide cover the common cases for now; we'd rather get the most-requested feature gaps closed first.",
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
        <UseToolCta toolSlug="/jpg-to-pdf" />
        <UseToolCta toolSlug="/ocr-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
