import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-fill-a-pdf-on-iphone")!;

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
    id: "the-60-second-method-safari-no-app",
    text: "The 60-second method (Safari, no app)",
    depth: 2 as const,
  },
  {
    id: "when-safaris-built-in-fill-doesnt-cut-it",
    text: "When Safari's built-in fill doesn't cut it",
    depth: 2 as const,
  },
  {
    id: "filling-a-pdf-on-iphone-for-someone-else",
    text: "Filling a PDF on iPhone for someone else",
    depth: 2 as const,
  },
  {
    id: "tips-that-actually-save-time",
    text: "Tips that actually save time",
    depth: 2 as const,
  },
  {
    id: "when-you-should-still-install-an-app",
    text: "When you should still install an app",
    depth: 2 as const,
  },
  { id: "in-one-sentence", text: "In one sentence", depth: 2 as const },
];

const FAQS: MdxFaq[] = [
  {
    q: "Does Safari work for every PDF form on iPhone?",
    a: "It works for PDFs with real AcroForm fields. PDFs that look like forms but don't have actual fields can't be filled in Safari directly — use the Create Fillable PDF tool first to add fields, then fill.",
  },
  {
    q: "Do I need iOS 17 or later?",
    a: "Safari's PDF form filling has worked since around iOS 14. Newer iOS versions add more polish but the core feature has been there for years.",
  },
  {
    q: "Is my PDF uploaded if I use the tools on this site?",
    a: "No. All the tools (Fill PDF, Sign PDF, Create Fillable PDF) run in your browser tab on the phone. The file never leaves your device.",
  },
  {
    q: "Can I email the filled PDF directly from Safari?",
    a: "Yes. After saving via the share sheet, choose 'Mail' as the destination and Safari opens a compose window with the PDF attached.",
  },
  {
    q: "What if the PDF is encrypted with a password?",
    a: "Safari can open password-protected PDFs but the form-fill UI may be hit-or-miss. Use the Unlock PDF tool first to remove the password, then fill in Safari or in the Fill PDF tool.",
  },
  {
    q: "Will my signature carry across to all the form's signature fields?",
    a: "Each signature field needs to be placed individually. The Sign PDF tool lets you save a signature locally so you can re-use it without redrawing.",
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
        <UseToolCta toolSlug="/fill-pdf" />
        <UseToolCta toolSlug="/sign-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
