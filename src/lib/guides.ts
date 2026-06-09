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
  /** Other guides this one funnels into / belongs alongside in a cluster. */
  relatedGuideSlugs?: string[];
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
    relatedGuideSlugs: [
      "how-to-fill-a-pdf-on-iphone",
      "how-to-add-signature-to-pdf",
      "how-to-annotate-a-pdf",
    ],
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
    relatedGuideSlugs: [
      "how-to-scan-documents-to-pdf",
      "how-to-fill-a-pdf-on-iphone",
      "how-to-add-signature-to-pdf",
    ],
  },
  {
    slug: "how-to-scan-documents-to-pdf",
    title: "How to scan documents to a searchable PDF",
    description:
      "Turn a paper document into a searchable PDF: scan or photograph it, then run OCR in your browser. No upload. Works on iPhone, Android, and laptop.",
    datePublished: "2026-06-09",
    toolSlug: "/ocr-pdf",
    primaryKeyword: "how to scan documents to pdf",
    excerpt:
      "From paper to searchable PDF in one minute, all in your browser. Includes the tips that actually move quality.",
    relatedGuideSlugs: [
      "how-to-turn-iphone-photos-into-a-pdf",
      "how-to-extract-images-from-a-pdf",
      "how-to-edit-a-pdf",
    ],
  },
  {
    slug: "how-to-add-signature-to-pdf",
    title: "How to add a signature to a PDF — draw, type, or upload",
    description:
      "Three ways to sign a PDF in your browser: draw with a mouse or finger, type your name in a handwriting font, or upload a signature image. All baked into the file.",
    datePublished: "2026-06-09",
    toolSlug: "/sign-pdf",
    primaryKeyword: "how to add signature to pdf",
    excerpt:
      "Three signature modes, one drag to place, save to reuse on the same device. Nothing uploaded.",
    relatedGuideSlugs: [
      "how-to-fill-a-pdf-on-iphone",
      "how-to-annotate-a-pdf",
      "how-to-make-a-pdf-fillable",
    ],
  },
  {
    slug: "how-to-add-watermark-to-pdf",
    title: "How to add a watermark to a PDF — text, image, your choice",
    description:
      "Add a text or image watermark to every page of a PDF (or a specific page range), with control over opacity, position, rotation, and diagonal tiling. Browser-only.",
    datePublished: "2026-06-09",
    toolSlug: "/add-watermark-to-pdf",
    primaryKeyword: "how to add watermark to pdf",
    excerpt:
      "DRAFT, CONFIDENTIAL, your logo — every option, baked into the file, all in your browser.",
    relatedGuideSlugs: [
      "how-to-remove-watermark-from-pdf",
      "how-to-redact-a-pdf",
      "how-to-edit-a-pdf",
    ],
  },
  {
    slug: "how-to-remove-watermark-from-pdf",
    title: "How to remove a watermark from a PDF (honestly)",
    description:
      "Some PDF watermarks can be removed, some can't. Here's the difference, the 60-second method for the ones that can, and what to do for the ones that can't.",
    datePublished: "2026-06-09",
    toolSlug: "/remove-watermark-from-pdf",
    primaryKeyword: "how to remove watermark from pdf",
    excerpt:
      "Overlay text watermarks: removable. Flattened image watermarks: not really. Here's how to tell which is which.",
    relatedGuideSlugs: [
      "how-to-add-watermark-to-pdf",
      "how-to-redact-a-pdf",
      "how-to-remove-password-from-pdf",
    ],
  },
  {
    slug: "how-to-redact-a-pdf",
    title: "How to redact a PDF — properly, so the text is actually gone",
    description:
      "A black box drawn on top of text is not redaction. Here's how to truly remove sensitive content from a PDF, and how to check that it worked.",
    datePublished: "2026-06-09",
    toolSlug: "/redact-pdf",
    primaryKeyword: "how to redact a pdf",
    excerpt:
      "Most 'redact PDF' tools just draw a black box on top. The text underneath is still copyable. Here's the right way.",
    relatedGuideSlugs: [
      "how-to-edit-a-pdf",
      "how-to-remove-watermark-from-pdf",
      "how-to-annotate-a-pdf",
    ],
  },
  {
    slug: "how-to-annotate-a-pdf",
    title: "How to annotate a PDF — highlight, type, sketch",
    description:
      "Highlight passages, type comments, draw shapes, or sketch by hand on any PDF. All in your browser, no signup.",
    datePublished: "2026-06-09",
    toolSlug: "/annotate-pdf",
    primaryKeyword: "how to annotate a pdf",
    excerpt:
      "Five annotation modes, every popular reader compatible, nothing uploaded. The fast guide.",
    relatedGuideSlugs: [
      "how-to-edit-a-pdf",
      "how-to-redact-a-pdf",
      "how-to-add-signature-to-pdf",
    ],
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
    relatedGuideSlugs: [
      "how-to-edit-a-pdf",
      "how-to-redact-a-pdf",
      "how-to-make-a-pdf-fillable",
    ],
  },

  /* ─────────────── Week 10: cluster expansion ─────────────── */
  {
    slug: "how-to-edit-a-pdf",
    title: "How to edit a PDF — a practical, honest map of your options",
    description:
      "'Edit a PDF' means five different things. Here's which one you actually need, and the right tool for each — all in your browser.",
    datePublished: "2026-06-09",
    primaryKeyword: "how to edit a pdf",
    excerpt:
      "Filling, annotating, redacting, signing, watermarking — each is a different operation. The honest breakdown plus the tool for each.",
    relatedGuideSlugs: [
      "how-to-make-a-pdf-fillable",
      "how-to-annotate-a-pdf",
      "how-to-redact-a-pdf",
      "how-to-add-signature-to-pdf",
    ],
  },
  {
    slug: "how-to-extract-images-from-a-pdf",
    title: "How to extract images from a PDF — three reliable methods",
    description:
      "Pull the embedded images out of a PDF and save them as PNG or JPG. Three methods compared, no signup, browser-only when possible.",
    datePublished: "2026-06-09",
    primaryKeyword: "how to extract images from a pdf",
    excerpt:
      "The fast path, the surgical path, and the path for tricky PDFs. Plus when 'extract' is the wrong question entirely.",
    relatedGuideSlugs: [
      "how-to-scan-documents-to-pdf",
      "how-to-turn-iphone-photos-into-a-pdf",
      "how-to-edit-a-pdf",
    ],
  },
  {
    slug: "how-to-rotate-pages-in-a-pdf",
    title: "How to rotate pages in a PDF (single page or all)",
    description:
      "Rotate a single page, a range, or every page in a PDF — in your browser, with the rotation baked in so it survives in every reader.",
    datePublished: "2026-06-09",
    primaryKeyword: "how to rotate pages in a pdf",
    excerpt:
      "Three rotation paths depending on what you have and what you need. Including the case where rotation is hiding a different problem.",
    relatedGuideSlugs: [
      "how-to-edit-a-pdf",
      "how-to-scan-documents-to-pdf",
      "how-to-annotate-a-pdf",
    ],
  },
  {
    slug: "how-to-fill-a-pdf-on-iphone",
    title: "How to fill out a PDF on iPhone (Safari only, no app needed)",
    description:
      "Fill out a PDF form on iPhone without installing an app. Three approaches; the one most people miss is the fastest.",
    datePublished: "2026-06-09",
    toolSlug: "/fill-pdf",
    primaryKeyword: "how to fill a pdf on iphone",
    excerpt:
      "Mobile Safari is more capable than people realize. Here's the 60-second method for iPhone, no app store required.",
    relatedGuideSlugs: [
      "how-to-make-a-pdf-fillable",
      "how-to-add-signature-to-pdf",
      "how-to-turn-iphone-photos-into-a-pdf",
    ],
  },
  {
    slug: "pdf-vs-docx-which-to-send",
    title: "PDF vs DOCX — which format to send (a practical guide)",
    description:
      "PDF for fidelity, DOCX for collaboration. The full decision tree, including the cases nobody talks about — and how to convert cleanly when you change your mind.",
    datePublished: "2026-06-09",
    primaryKeyword: "pdf vs docx",
    excerpt:
      "When PDF is the wrong choice. When DOCX is the wrong choice. The three workflows most people get wrong.",
    relatedGuideSlugs: [
      "how-to-edit-a-pdf",
      "how-to-make-a-pdf-fillable",
      "how-to-add-signature-to-pdf",
    ],
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return guides.find((g) => g.slug === slug);
}

export function relatedGuides(slug: string, max = 3): GuideMeta[] {
  const guide = getGuide(slug);
  if (!guide?.relatedGuideSlugs) return [];
  return guide.relatedGuideSlugs
    .map(getGuide)
    .filter((g): g is GuideMeta => Boolean(g))
    .slice(0, max);
}
