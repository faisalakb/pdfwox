import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
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

const FAQS: MdxFaq[] = [
  {
    q: "Will the recipient see this as a 'real' signature?",
    a: "It will look like a real signature in any reader and in any printout. Whether it's legally binding depends on the document and your jurisdiction. For most everyday agreements — employment, residential rental, small contracts — yes.",
  },
  {
    q: "Are my files uploaded?",
    a: "No. The PDF, the signature image, and the placement step all run in your browser. Verifiable in DevTools → Network.",
  },
  {
    q: "Can I undo a placement?",
    a: "Yes. Each placement appears in the right-hand list with an '×' to remove it. Re-click on the page to place it again.",
  },
  {
    q: "What if I'm on a phone?",
    a: "Drag your finger across the canvas to draw. The result is captured at high resolution. Works in any mobile browser; iOS Safari is particularly good because of the precise capacitive touch.",
  },
  {
    q: "When should I not use an electronic signature?",
    a: "Documents requiring notarisation, a cryptographic X.509 certificate (as some banks require), or wills and real estate transfers in certain jurisdictions may need a different process. When in doubt, ask the recipient whether they need an electronic image signature or a cryptographic one.",
  },
  {
    q: "Can I rotate the signature?",
    a: "Not currently. The signature is placed at the angle it was drawn. If you need it rotated, rotate the source image before uploading.",
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
        <UseToolCta toolSlug="/sign-pdf" />
        <UseToolCta toolSlug="/fill-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
