import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
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
  { id: "the-five-choices-that-matter", text: "The five choices that matter", depth: 2 as const },
  { id: "the-60-second-method", text: "The 60-second method", depth: 2 as const },
  { id: "choosing-text-content", text: "Choosing text content", depth: 2 as const },
  { id: "choosing-image-content", text: "Choosing image content", depth: 2 as const },
  { id: "tiling-that-does-the-job", text: "Tiling that does the job", depth: 2 as const },
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
        <UseToolCta toolSlug="/add-watermark-to-pdf" />
        <UseToolCta toolSlug="/remove-watermark-from-pdf" />
      </Container>
    </MdxLayout>
  );
}
