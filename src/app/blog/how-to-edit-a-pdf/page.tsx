import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-edit-a-pdf")!;

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
    id: "the-five-things-edit-a-pdf-usually-means",
    text: "The five things 'edit a PDF' usually means",
    depth: 2 as const,
  },
  { id: "the-decision-tree", text: "The decision tree", depth: 2 as const },
  {
    id: "when-you-really-need-a-pdf-editor",
    text: "When you really need a PDF editor",
    depth: 2 as const,
  },
  {
    id: "what-about-converting-a-pdf-to-word-and-editing-there",
    text: "What about converting a PDF to Word and editing there?",
    depth: 2 as const,
  },
  {
    id: "how-browser-based-editing-protects-you",
    text: "How browser-based editing protects you",
    depth: 2 as const,
  },
  {
    id: "two-tips-that-save-time",
    text: "Two tips that save time",
    depth: 2 as const,
  },
  { id: "putting-it-together", text: "Putting it together", depth: 2 as const },
];

const FAQS: MdxFaq[] = [
  {
    q: "Can I edit the text inside a PDF in my browser?",
    a: "You can add text on top (annotate), but you can't rewrite the existing body text in a way that preserves the original layout. For that, edit the source document or use a desktop PDF editor.",
  },
  {
    q: "Is browser-based editing safe for sensitive documents?",
    a: "Yes — all the editing tools on this site run in your browser. The PDF never goes to a server. Sensitive documents (contracts, tax returns, medical records) never leave your device.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Every editing tool is a webpage. The processing libraries run inside the browser tab via WebAssembly.",
  },
  {
    q: "Will the recipient see the edits in any reader?",
    a: "Yes. Edits are baked into the page content, so they appear in Adobe Reader, Preview, mobile readers, print output — anywhere the PDF opens.",
  },
  {
    q: "Can I undo an edit after I download?",
    a: "Most edits are reversible if you keep the original. Redaction is the exception — it rebuilds pages as images, so always save a backup before redacting.",
  },
  {
    q: "What if the PDF is password-protected?",
    a: "Use the Unlock PDF tool first if you have the password. If you don't, no online tool can help — modern PDFs use AES-256.",
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
        <UseToolCta toolSlug="/annotate-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
