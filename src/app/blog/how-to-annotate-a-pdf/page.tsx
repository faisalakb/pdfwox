import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
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
        <UseToolCta toolSlug="/annotate-pdf" />
        <UseToolCta toolSlug="/sign-pdf" />
      </Container>
    </MdxLayout>
  );
}
