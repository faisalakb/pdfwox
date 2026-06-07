import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-remove-password-from-pdf")!;

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
    id: "what-remove-a-password-really-means",
    text: "What 'remove a password' really means",
    depth: 2 as const,
  },
  { id: "the-90-second-method", text: "The 90-second method", depth: 2 as const },
  {
    id: "what-this-can-and-cant-do",
    text: "What this can and can't do",
    depth: 2 as const,
  },
  {
    id: "why-files-stay-private-matters-here",
    text: "Why 'files stay private' matters here",
    depth: 2 as const,
  },
  {
    id: "putting-a-password-back-on",
    text: "Putting a password back on",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "the-honest-summary",
    text: "The honest summary",
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
        <UseToolCta toolSlug="/unlock-pdf" />
        <UseToolCta toolSlug="/protect-pdf" />
      </Container>
    </MdxLayout>
  );
}
