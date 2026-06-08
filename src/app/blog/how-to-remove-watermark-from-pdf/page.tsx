import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
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
  { id: "three-kinds-of-watermark", text: "Three kinds of watermark", depth: 2 as const },
  { id: "the-90-second-method-for-overlay-text-watermarks", text: "The 90-second method for overlay text watermarks", depth: 2 as const },
  { id: "what-this-approach-cant-do", text: "What this approach can't do", depth: 2 as const },
  { id: "what-you-can-do-for-rasterized-watermarks", text: "What you can do for rasterized watermarks", depth: 2 as const },
  { id: "frequently-asked-questions", text: "Frequently asked questions", depth: 2 as const },
  { id: "the-short-version", text: "The short version", depth: 2 as const },
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
        <UseToolCta toolSlug="/remove-watermark-from-pdf" />
        <UseToolCta toolSlug="/redact-pdf" />
      </Container>
    </MdxLayout>
  );
}
