import type { Metadata } from "next";
import { MdxLayout } from "@/components/blog/MdxLayout";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-add-signature-to-pdf")!;

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
    id: "three-ways-to-make-a-signature",
    text: "Three ways to make a signature",
    depth: 2 as const,
  },
  {
    id: "the-60-second-method",
    text: "The 60-second method",
    depth: 2 as const,
  },
  {
    id: "save-this-signature-on-this-device",
    text: "'Save this signature on this device'",
    depth: 2 as const,
  },
  {
    id: "when-you-should-not-use-this",
    text: "When you should not use this",
    depth: 2 as const,
  },
  {
    id: "tips-for-clean-placement",
    text: "Tips for clean placement",
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
        <UseToolCta toolSlug="/sign-pdf" />
        <UseToolCta toolSlug="/fill-pdf" />
      </Container>
    </MdxLayout>
  );
}
