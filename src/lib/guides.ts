/**
 * Guides registry — paired blog posts for tools. Keeps the blog index,
 * sitemap, and per-page metadata in sync.
 *
 * Add a new guide here when its MDX content lands.
 */

export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  datePublished: string; // ISO date
  dateModified?: string;
  toolSlug?: string; // optional CTA target
  primaryKeyword?: string;
  excerpt: string;
}

export const guides: GuideMeta[] = [
  {
    slug: "how-to-make-a-pdf-fillable",
    title: "How to make a PDF fillable (without paying for Acrobat)",
    description:
      "Turn any PDF into a form with real fillable fields — right in your browser, no signup, no upload.",
    datePublished: "2026-06-07",
    toolSlug: "/create-fillable-pdf",
    primaryKeyword: "how to make a pdf fillable",
    excerpt:
      "Drag rectangles onto the page to add text fields, checkboxes, and signature spots. Save once — recipients fill it anywhere.",
  },
  {
    slug: "how-to-turn-iphone-photos-into-a-pdf",
    title: "How to turn iPhone (HEIC) photos into a PDF",
    description:
      "iPhones save photos as HEIC, which Windows and many apps can't read. Here's the 60-second browser-only way to combine them into a PDF anyone can open.",
    datePublished: "2026-06-07",
    toolSlug: "/heic-to-pdf",
    primaryKeyword: "how to turn iphone photos into a pdf",
    excerpt:
      "HEIC is great on iPhone, painful everywhere else. Decode and combine into a clean multi-page PDF without uploading anything.",
  },
  {
    slug: "how-to-remove-password-from-pdf",
    title: "How to remove a password from a PDF (safely, in your browser)",
    description:
      "The honest guide to removing a PDF password — what it can do, what it absolutely cannot do, and the 90-second method that doesn't upload your file.",
    datePublished: "2026-06-07",
    toolSlug: "/unlock-pdf",
    primaryKeyword: "how to remove password from pdf",
    excerpt:
      "Strip the password from a PDF you can already open, including owner restrictions like 'can't print' or 'can't copy'.",
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return guides.find((g) => g.slug === slug);
}
