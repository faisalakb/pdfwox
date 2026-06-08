import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
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
        <UseToolCta toolSlug="/redact-pdf" />
        <UseToolCta toolSlug="/annotate-pdf" />
      </Container>
    </MdxLayout>
  );
}
