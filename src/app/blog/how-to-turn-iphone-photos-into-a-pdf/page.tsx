import type { Metadata } from "next";
import { MdxLayout, type MdxFaq } from "@/components/blog/MdxLayout";
import { RelatedGuides } from "@/components/blog/RelatedGuides";
import { UseToolCta } from "@/components/blog/UseToolCta";
import { Container } from "@/components/ui/Container";
import { getGuide } from "@/lib/guides";
import { SITE } from "@/lib/site";
import Content from "./content.mdx";

export const dynamic = "force-static";

const GUIDE = getGuide("how-to-turn-iphone-photos-into-a-pdf")!;

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
    id: "why-heic-isnt-friendly-outside-apple",
    text: "Why HEIC isn't friendly outside Apple",
    depth: 2 as const,
  },
  {
    id: "the-60-second-method",
    text: "The 60-second method",
    depth: 2 as const,
  },
  {
    id: "when-to-mix-heic-with-regular-jpgs-or-pngs",
    text: "When to mix HEIC with regular JPGs or PNGs",
    depth: 2 as const,
  },
  {
    id: "tips-for-clean-looking-results",
    text: "Tips for clean-looking results",
    depth: 2 as const,
  },
  {
    id: "frequently-asked-questions",
    text: "Frequently asked questions",
    depth: 2 as const,
  },
  {
    id: "working-with-the-rest-of-the-toolkit",
    text: "Working with the rest of the toolkit",
    depth: 2 as const,
  },
];

const FAQS: MdxFaq[] = [
  {
    q: "What's the difference between HEIC and HEIF?",
    a: "HEIC is Apple's name for files using the HEIF container with HEVC-encoded image data. In practice they're the same thing for most users, and the tool accepts both extensions.",
  },
  {
    q: "Will the output PDF be smaller than the original photos?",
    a: "Usually yes for HEIC — we decode HEIC and re-encode as JPEG at high quality. JPEG is typically a bit larger than HEIC per photo, but the combined PDF is generally smaller than the sum of the originals because the PDF container deduplicates shared data.",
  },
  {
    q: "Does the PDF preserve photo metadata (date, GPS)?",
    a: "No. The PDF wraps the visible image only — EXIF metadata from the original photos isn't carried over. Save the original HEIC files alongside the PDF if you need GPS coordinates or timestamps.",
  },
  {
    q: "Is anything uploaded?",
    a: "No. The entire conversion — including HEIC decoding — happens in your browser using a WebAssembly library. Your photos never reach our server. No signup and no account required.",
  },
  {
    q: "What about Live Photos?",
    a: "We extract just the still image — the motion clip in a Live Photo is dropped. For a PDF, that's almost always what you want.",
  },
  {
    q: "Can I add photos from non-iPhone sources in the same PDF?",
    a: "Yes. You can mix HEIC files with regular JPGs or PNGs in the same drop zone. They'll be combined in the order you arrange them. For a JPG-only workflow, the JPG to PDF tool has the same engine with a simpler interface.",
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
        <UseToolCta toolSlug="/heic-to-pdf" />
        <UseToolCta toolSlug="/jpg-to-pdf" />
        <RelatedGuides slug={GUIDE.slug} />
      </Container>
    </MdxLayout>
  );
}
