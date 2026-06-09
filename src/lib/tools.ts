/**
 * Tool registry — single source of truth.
 * Homepage grid, nav, sitemap, schema, and related-tools blocks all read from this.
 * Adding a tool here adds it everywhere automatically.
 */

export type ToolCategory =
  | "forms"
  | "convert"
  | "security"
  | "edit"
  | "sign"
  | "ocr";

export type ToolRuntime = "client" | "server";

export type ToolStatus = "live" | "soon";

export interface ToolFAQ {
  q: string;
  a: string;
}

export interface ToolHowToStep {
  name: string;
  text: string;
}

export interface Tool {
  slug: string; // url path, e.g. "/fill-pdf"
  name: string; // display name, e.g. "Fill PDF"
  h1: string; // page H1
  title: string; // <title> — keep ≤60 chars
  description: string; // meta description (intent-led)
  shortDescription: string; // for tile/card
  category: ToolCategory;
  runtime: ToolRuntime;
  status: ToolStatus;
  wave: 1 | 2 | 3;
  accepts: string[]; // MIME types or extensions
  primaryKeyword: string; // for SEO
  relatedSlugs: string[]; // siblings (4–6)
  guideSlug?: string; // /blog/<slug>
  howTo: ToolHowToStep[];
  faqs: ToolFAQ[];
  privacyLine: string;
}

const CLIENT_PRIVACY =
  "Files are processed entirely in your browser. Nothing is uploaded to any server.";

// Kept for the future cloud-OCR opt-in (see Week 9 / Appendix F). Until
// a tool is flagged runtime: "server", no live tool references it; the
// underscore prefix marks it intentionally unused for ESLint.
const _SERVER_PRIVACY =
  "Files are processed on our server and deleted immediately after the result is returned. We don't store or share your data.";
void _SERVER_PRIVACY;

export const tools: Tool[] = [
  /* ─────────────── WAVE 1 ─────────────── */
  {
    slug: "/fill-pdf",
    name: "Fill PDF",
    h1: "Fill out PDF forms online",
    title: "Fill Out PDF Forms Online Free — No Signup",
    description:
      "Open a PDF form in your browser, type into the fields, and download the filled version. Works offline. No signup, no upload.",
    shortDescription: "Type into PDF form fields and download a filled copy.",
    category: "forms",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["application/pdf"],
    primaryKeyword: "fillable pdf",
    relatedSlugs: ["/create-fillable-pdf", "/sign-pdf", "/annotate-pdf"],
    guideSlug: "how-to-make-a-pdf-fillable",
    howTo: [
      {
        name: "Open your PDF",
        text: "Drag the PDF onto the page or click to choose a file.",
      },
      {
        name: "Fill the fields",
        text: "Type into text fields, tick checkboxes, choose from dropdowns.",
      },
      {
        name: "Download",
        text: "Click Download to save your filled PDF. Optionally flatten it first to lock the values.",
      },
    ],
    faqs: [
      {
        q: "Are my files uploaded anywhere?",
        a: "No. Everything runs locally in your browser. The PDF never leaves your device.",
      },
      {
        q: "Can I flatten the form so values can't be edited?",
        a: "Yes — toggle Flatten before downloading and the fields become permanent.",
      },
      {
        q: "Does it work on scanned PDFs?",
        a: "Only PDFs with real form fields (AcroForm). For scans, use our Annotate tool to type on top instead.",
      },
      {
        q: "Can I fill multiple PDFs at once?",
        a: "Open them one at a time for now. Batch is on the roadmap.",
      },
      {
        q: "Will it work offline?",
        a: "After the page loads once, yes — you can disconnect and keep working.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/create-fillable-pdf",
    name: "Create fillable PDF",
    h1: "Create a fillable PDF from any document",
    title: "Create Fillable PDF Online Free — Add Form Fields",
    description:
      "Turn any PDF into a fillable form. Draw text fields, checkboxes, and signatures in your browser. No signup.",
    shortDescription: "Add form fields to any PDF.",
    category: "forms",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["application/pdf"],
    primaryKeyword: "create fillable pdf",
    relatedSlugs: ["/fill-pdf", "/sign-pdf", "/annotate-pdf"],
    guideSlug: "how-to-make-a-pdf-fillable",
    howTo: [
      {
        name: "Upload a PDF",
        text: "Drop or pick the PDF you want to make fillable.",
      },
      {
        name: "Draw fields",
        text: "Drag rectangles over the page to add text fields, checkboxes, or signature areas.",
      },
      {
        name: "Download",
        text: "Save your fillable PDF — recipients can fill it in any PDF reader.",
      },
    ],
    faqs: [
      {
        q: "What field types can I add?",
        a: "Text, multi-line text, checkbox, dropdown, and signature.",
      },
      {
        q: "Will it work in Adobe Reader?",
        a: "Yes — we output standard AcroForm fields supported by all major readers.",
      },
      {
        q: "Are files uploaded?",
        a: "No. The whole tool runs in your browser; nothing is sent to a server.",
      },
      {
        q: "Can I rename or required-flag fields?",
        a: "Yes, each field exposes a name and a required toggle in the side panel.",
      },
      {
        q: "Can I add fields to scanned PDFs?",
        a: "Yes — fields are drawn on the page regardless of whether the page is text or image.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/heic-to-pdf",
    name: "HEIC to PDF",
    h1: "Convert HEIC photos to PDF",
    title: "HEIC to PDF — Convert iPhone Photos Free",
    description:
      "Turn iPhone HEIC photos into a single PDF in your browser. Reorder pages, pick page size, no signup.",
    shortDescription: "Make a PDF from iPhone HEIC photos.",
    category: "convert",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["image/heic", "image/heif"],
    primaryKeyword: "heic to pdf",
    relatedSlugs: ["/png-to-pdf", "/jpg-to-pdf", "/create-fillable-pdf"],
    guideSlug: "how-to-turn-iphone-photos-into-a-pdf",
    howTo: [
      {
        name: "Drop your HEIC photos",
        text: "Drag one or more .heic / .heif files onto the page.",
      },
      {
        name: "Reorder & size",
        text: "Drag thumbnails to reorder. Pick A4, Letter, or fit-to-image.",
      },
      {
        name: "Download PDF",
        text: "Click Make PDF to download a single document.",
      },
    ],
    faqs: [
      {
        q: "Why isn't HEIC supported natively in Windows?",
        a: "Most browsers can't decode HEIC. We decode it locally with a WASM library — still no upload.",
      },
      {
        q: "Does it preserve image quality?",
        a: "Yes. We embed images at full resolution; downscale is opt-in.",
      },
      {
        q: "How many photos can I combine?",
        a: "Hundreds, depending on size. Very large batches run in a Web Worker so the UI stays responsive.",
      },
      {
        q: "Can I mix HEIC with JPG/PNG?",
        a: "Yes — drop them all in. They're combined in the order you set.",
      },
      {
        q: "Files uploaded?",
        a: "No. The conversion runs entirely in your browser.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/png-to-pdf",
    name: "PNG to PDF",
    h1: "Convert PNG images to PDF",
    title: "PNG to PDF Online Free — No Signup",
    description:
      "Combine PNG images into a single PDF in your browser. Reorder, choose page size, no upload required.",
    shortDescription: "Combine PNG images into one PDF.",
    category: "convert",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["image/png"],
    primaryKeyword: "png to pdf",
    relatedSlugs: ["/jpg-to-pdf", "/heic-to-pdf", "/create-fillable-pdf"],
    guideSlug: "how-to-turn-iphone-photos-into-a-pdf",
    howTo: [
      { name: "Drop PNGs", text: "Pick one or many PNG files." },
      { name: "Order pages", text: "Drag to reorder. Set the page size." },
      { name: "Download PDF", text: "Click Make PDF to download." },
    ],
    faqs: [
      {
        q: "Will transparency be preserved?",
        a: "PDF doesn't support page-level transparency — we composite onto a white background.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. Everything happens in your browser.",
      },
      {
        q: "Can I pick the page size?",
        a: "Yes — A4, Letter, or fit-to-image.",
      },
      {
        q: "Image too big?",
        a: "We process large files in a Web Worker so the page stays responsive.",
      },
      {
        q: "Can I combine PNG and JPG?",
        a: "Yes, drop both in and we'll combine them in the order you set.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/jpg-to-pdf",
    name: "JPG to PDF",
    h1: "Convert JPG images to PDF",
    title: "JPG to PDF Online Free — No Signup",
    description:
      "Combine JPG images into a single PDF in your browser. No upload, no watermark.",
    shortDescription: "Combine JPG photos into one PDF.",
    category: "convert",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["image/jpeg"],
    primaryKeyword: "jpg to pdf",
    relatedSlugs: ["/png-to-pdf", "/heic-to-pdf", "/create-fillable-pdf"],
    guideSlug: "how-to-turn-iphone-photos-into-a-pdf",
    howTo: [
      { name: "Drop JPGs", text: "Pick one or many JPG files." },
      { name: "Order pages", text: "Drag to reorder. Set the page size." },
      { name: "Download PDF", text: "Click Make PDF to download." },
    ],
    faqs: [
      { q: "Are files uploaded?", a: "No, files stay on your device." },
      {
        q: "Quality loss?",
        a: "We embed the original JPEG bytes — no re-encoding, no quality loss.",
      },
      { q: "Page size?", a: "Choose A4, Letter, or fit-to-image." },
      { q: "Reorder pages?", a: "Yes, drag thumbnails to reorder." },
      {
        q: "Can I add a margin?",
        a: "Yes — choose narrow, normal, or none in the options panel.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/unlock-pdf",
    name: "Unlock PDF",
    h1: "Unlock a PDF you have the password for",
    title: "Unlock PDF Online Free — Remove Password",
    description:
      "Remove the password from a PDF you can already open. Runs in your browser — your password never leaves your device.",
    shortDescription: "Remove the password from PDFs you own.",
    category: "security",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["application/pdf"],
    primaryKeyword: "unlock pdf",
    relatedSlugs: ["/protect-pdf", "/fill-pdf", "/sign-pdf"],
    guideSlug: "how-to-remove-password-from-pdf",
    howTo: [
      {
        name: "Upload PDF",
        text: "Drop a password-protected PDF you have the password for.",
      },
      {
        name: "Enter password",
        text: "Type the password used to open the file.",
      },
      { name: "Download", text: "Download an unlocked copy with no password." },
    ],
    faqs: [
      {
        q: "Can you crack a forgotten password?",
        a: "No, and we wouldn't — this tool only re-saves a PDF you can already open.",
      },
      {
        q: "Does this also remove printing/copy restrictions?",
        a: "Yes, owner restrictions are removed when you have the open password.",
      },
      {
        q: "Is my password sent anywhere?",
        a: "No. Both the file and the password are handled entirely in your browser.",
      },
      {
        q: "What about certificate-encrypted PDFs?",
        a: "Those require the private key/certificate, which we can't process in a generic web tool.",
      },
      { q: "Works offline?", a: "Yes, after first load." },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/protect-pdf",
    name: "Protect PDF",
    h1: "Add a password to a PDF",
    title: "Protect PDF with Password — Free, In-Browser",
    description:
      "Add a password to any PDF in your browser. Pick the permissions you want to restrict.",
    shortDescription: "Add a password and restrict permissions.",
    category: "security",
    runtime: "client",
    status: "live",
    wave: 1,
    accepts: ["application/pdf"],
    primaryKeyword: "protect pdf",
    relatedSlugs: ["/unlock-pdf", "/sign-pdf", "/redact-pdf"],
    guideSlug: "how-to-remove-password-from-pdf",
    howTo: [
      { name: "Upload PDF", text: "Drop the PDF you want to protect." },
      {
        name: "Set a password",
        text: "Pick a strong password and any restrictions (print, copy, modify).",
      },
      { name: "Download", text: "Download the protected PDF." },
    ],
    faqs: [
      { q: "What encryption is used?", a: "AES-256, the modern PDF standard." },
      {
        q: "Can permissions stop a determined attacker?",
        a: "Restrictions are advisory and can be bypassed by some tools. For real confidentiality, use a strong open password.",
      },
      { q: "File uploaded?", a: "No — encryption runs in your browser." },
      {
        q: "Lose my password?",
        a: "We can't recover it. Save it somewhere safe.",
      },
      {
        q: "Will Adobe Reader open it?",
        a: "Yes, AES-256 protected PDFs open in all modern readers.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },

  /* ─────────────── WAVE 2 ─────────────── */
  {
    slug: "/redact-pdf",
    name: "Redact PDF",
    h1: "Permanently redact text and images in a PDF",
    title: "Redact PDF Online — Truly Remove, Not Just Cover",
    description:
      "Draw boxes over sensitive text and we rasterize the page so the underlying content is genuinely removed. Free, in-browser.",
    shortDescription: "Truly remove sensitive content from PDFs.",
    category: "edit",
    runtime: "client",
    status: "live",
    wave: 2,
    accepts: ["application/pdf"],
    primaryKeyword: "redact pdf",
    relatedSlugs: ["/annotate-pdf", "/protect-pdf", "/sign-pdf"],
    guideSlug: "how-to-redact-a-pdf",
    howTo: [
      { name: "Open the PDF", text: "Drop or pick the file." },
      {
        name: "Draw redaction boxes",
        text: "Drag rectangles over text or images you want removed.",
      },
      {
        name: "Apply & download",
        text: "We rasterize the affected pages so the data is gone — not just covered.",
      },
    ],
    faqs: [
      {
        q: "Will a black box really hide my data?",
        a: "Only if the underlying content is removed. We rasterize the affected page so a copy/paste attack returns nothing.",
      },
      {
        q: "Can I redact entire pages?",
        a: "Yes, plus selected regions across multiple pages.",
      },
      { q: "Are files uploaded?", a: "No, everything is processed locally." },
      {
        q: "Will metadata still leak info?",
        a: "We also strip document metadata on export.",
      },
      {
        q: "Can I undo before downloading?",
        a: "Yes — redactions are previewed and reversible until you click Apply.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/annotate-pdf",
    name: "Annotate PDF",
    h1: "Annotate a PDF — highlight, draw, comment",
    title: "Annotate PDF Online Free — Highlight & Comment",
    description:
      "Highlight, draw, and comment on PDFs in your browser. No upload, no signup.",
    shortDescription: "Highlight, draw, and comment on PDFs.",
    category: "edit",
    runtime: "client",
    status: "live",
    wave: 2,
    accepts: ["application/pdf"],
    primaryKeyword: "annotate pdf",
    relatedSlugs: ["/redact-pdf", "/sign-pdf", "/fill-pdf"],
    guideSlug: "how-to-annotate-a-pdf",
    howTo: [
      {
        name: "Open the PDF",
        text: "Drop or pick the file you want to annotate.",
      },
      {
        name: "Mark it up",
        text: "Highlight, underline, draw, or add sticky notes.",
      },
      { name: "Download", text: "Export with your annotations baked in." },
    ],
    faqs: [
      {
        q: "Will my annotations be visible in Adobe Reader?",
        a: "Yes — they're written back as standard PDF annotations.",
      },
      {
        q: "Can I delete annotations later?",
        a: "Use Edit mode and delete any of them before exporting.",
      },
      {
        q: "Is the file uploaded?",
        a: "No — annotations are drawn and written locally.",
      },
      { q: "Multi-page support?", a: "Yes, full multi-page navigation." },
      {
        q: "Touch / pen support?",
        a: "Yes, drawing supports pen pressure on supported devices.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/add-watermark-to-pdf",
    name: "Add watermark to PDF",
    h1: "Add a watermark to your PDF",
    title: "Add Watermark to PDF Free — Text or Image",
    description:
      "Add a text or image watermark to every page of a PDF. Choose opacity, position, and tiling.",
    shortDescription: "Add text or image watermarks.",
    category: "edit",
    runtime: "client",
    status: "live",
    wave: 2,
    accepts: ["application/pdf"],
    primaryKeyword: "add watermark to pdf",
    relatedSlugs: ["/remove-watermark-from-pdf", "/protect-pdf", "/redact-pdf"],
    guideSlug: "how-to-add-watermark-to-pdf",
    howTo: [
      { name: "Upload PDF", text: "Drop your PDF onto the page." },
      {
        name: "Configure watermark",
        text: "Choose text or image, opacity, rotation, position, and tiling.",
      },
      { name: "Download", text: "Save the watermarked PDF." },
    ],
    faqs: [
      {
        q: "Can I watermark specific pages?",
        a: "Yes — pick a page range, or apply to all pages.",
      },
      {
        q: "Is the file uploaded?",
        a: "No, watermarking runs in your browser.",
      },
      {
        q: "Can I use a logo image?",
        a: "Yes — PNG (with transparency) and JPG are supported.",
      },
      {
        q: "Can it be removed later?",
        a: "If it was added as an overlay on selectable text, yes. Flattened/rasterized watermarks aren't reliably removable.",
      },
      {
        q: "Page-fill / diagonal tile?",
        a: "Yes — choose a single placement or a tiled fill at any angle.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/remove-watermark-from-pdf",
    name: "Remove watermark from PDF",
    h1: "Remove watermark from a PDF",
    title: "Remove Watermark from PDF — Best-Effort, Free",
    description:
      "Best-effort watermark removal for overlay text. Flattened-image watermarks cannot be reliably removed — we tell you up-front.",
    shortDescription: "Best-effort watermark removal.",
    category: "edit",
    runtime: "client",
    status: "live",
    wave: 2,
    accepts: ["application/pdf"],
    primaryKeyword: "remove watermark from pdf",
    relatedSlugs: ["/add-watermark-to-pdf", "/redact-pdf", "/annotate-pdf"],
    guideSlug: "how-to-remove-watermark-from-pdf",
    howTo: [
      { name: "Upload PDF", text: "Drop the watermarked file." },
      {
        name: "Pick the watermark",
        text: "We highlight detected overlay watermarks. Select the one(s) to remove.",
      },
      { name: "Download", text: "Download a copy with the overlay removed." },
    ],
    faqs: [
      {
        q: "Why can't it remove all watermarks?",
        a: "If a watermark is flattened into the page image, there's no separate layer to remove. We tell you when that's the case.",
      },
      {
        q: "Is this legal?",
        a: "Only use it on PDFs you own or have permission to modify. We don't host or distribute removal of others' watermarks.",
      },
      { q: "Is the file uploaded?", a: "No, everything runs locally." },
      {
        q: "Multiple watermarks?",
        a: "Yes, select all the ones you want removed.",
      },
      {
        q: "Damage to the rest of the PDF?",
        a: "No — we only remove the selected overlay objects.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },

  /* ─────────────── WAVE 3 ─────────────── */
  {
    slug: "/sign-pdf",
    name: "Sign PDF",
    h1: "Sign a PDF — draw, type, or upload",
    title: "Sign PDF Online Free — Draw, Type, or Upload",
    description:
      "Add your signature to a PDF in three ways: draw, type, or upload an image. Place it anywhere, then download.",
    shortDescription: "Add your signature to any PDF.",
    category: "sign",
    runtime: "client",
    status: "live",
    wave: 3,
    accepts: ["application/pdf"],
    primaryKeyword: "sign pdf",
    relatedSlugs: ["/fill-pdf", "/create-fillable-pdf", "/protect-pdf"],
    guideSlug: "how-to-add-signature-to-pdf",
    howTo: [
      { name: "Upload PDF", text: "Drop the PDF you want to sign." },
      {
        name: "Create signature",
        text: "Draw on the canvas, type your name in a script font, or upload a signature image.",
      },
      {
        name: "Place & download",
        text: "Drag the signature into place, resize, and download the signed PDF.",
      },
    ],
    faqs: [
      {
        q: "Is this legally binding?",
        a: "An electronic signature counts in many jurisdictions for ordinary contracts. For specific legal use, check local rules.",
      },
      {
        q: "Is this a digital signature (cryptographic)?",
        a: "No — this is a visible electronic signature. We don't add cryptographic signatures in this tool.",
      },
      {
        q: "Is the file uploaded?",
        a: "No, signing happens entirely in your browser.",
      },
      {
        q: "Multi-page placement?",
        a: "Yes — place the signature on any page.",
      },
      {
        q: "Reuse my signature?",
        a: "Saved signatures persist in your browser's storage so you can reuse them locally.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/pdf-to-text",
    name: "PDF to Text",
    h1: "Extract text from a PDF",
    title: "PDF to Text — Extract Text Free",
    description:
      "Pull clean plain text out of any PDF in your browser. Text PDFs extract instantly; scanned PDFs go through in-browser OCR.",
    shortDescription: "Extract clean text — works on scans too.",
    category: "ocr",
    runtime: "client",
    status: "live",
    wave: 3,
    accepts: ["application/pdf"],
    primaryKeyword: "pdf to text",
    relatedSlugs: ["/ocr-pdf", "/fill-pdf", "/sign-pdf"],
    guideSlug: "how-to-scan-documents-to-pdf",
    howTo: [
      { name: "Upload PDF", text: "Drop or pick the PDF." },
      {
        name: "We extract text",
        text: "Text-based PDFs are parsed instantly. Scanned PDFs go through OCR in your browser.",
      },
      {
        name: "Edit & download",
        text: "Clean up artifacts if you want, then download a .txt file.",
      },
    ],
    faqs: [
      {
        q: "Is my file uploaded?",
        a: "No. Extraction and the OCR fallback both run in your browser tab. Verifiable in DevTools → Network.",
      },
      {
        q: "How does OCR work in the browser?",
        a: "Tesseract.js runs a WebAssembly OCR engine in a Web Worker. The first run downloads a ~3 MB English model; subsequent runs are fast.",
      },
      {
        q: "Will it work on a poorly scanned PDF?",
        a: "Quality depends on the scan. Clean, straight, high-contrast scans give the best results; faded or skewed scans return lower-quality text.",
      },
      {
        q: "Max file size?",
        a: "Bounded by your device memory; we've tested up to 50 MB.",
      },
      {
        q: "Will it preserve layout?",
        a: "Plain text loses layout. For a searchable PDF that keeps the original page, use OCR PDF.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/ocr-pdf",
    name: "OCR PDF",
    h1: "Make a scanned PDF searchable (OCR)",
    title: "OCR PDF — Make a Scan Searchable & Selectable",
    description:
      "Run OCR on a scanned PDF in your browser to add an invisible text layer. You can then select, copy, and search the text.",
    shortDescription: "Make scans searchable & selectable.",
    category: "ocr",
    runtime: "client",
    status: "live",
    wave: 3,
    accepts: ["application/pdf"],
    primaryKeyword: "ocr pdf",
    relatedSlugs: ["/pdf-to-text", "/sign-pdf", "/fill-pdf"],
    guideSlug: "how-to-scan-documents-to-pdf",
    howTo: [
      { name: "Upload PDF", text: "Drop the scanned PDF." },
      {
        name: "We OCR each page",
        text: "Tesseract.js runs in your browser; an invisible text layer is added behind the page image.",
      },
      {
        name: "Download searchable PDF",
        text: "The output looks identical but is now selectable and searchable.",
      },
    ],
    faqs: [
      {
        q: "Will the page look different?",
        a: "No — visually it's the same. We add an invisible text layer underneath.",
      },
      {
        q: "Does this run on your server?",
        a: "No. The OCR runs in your browser via Tesseract.js + WebAssembly. The first run downloads a ~3 MB English model; subsequent runs are fast.",
      },
      {
        q: "Editable text?",
        a: "Searchable, not editable. To edit, use PDF to Text and re-create the document.",
      },
      {
        q: "How accurate is OCR?",
        a: "Typically 90%+ on clean scans, less for low-resolution or skewed images.",
      },
      {
        q: "How long does it take?",
        a: "About 5–10 seconds per page on a modern laptop, plus the one-time model download.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },

  /* ─────────────── WAVE 3 long-tail converters ─────────────── */
  {
    slug: "/webp-to-pdf",
    name: "WebP to PDF",
    h1: "Convert WebP images to PDF",
    title: "WebP to PDF Online Free — No Signup",
    description:
      "Combine WebP images into a single PDF in your browser. Reorder, choose page size, no upload required.",
    shortDescription: "Combine WebP images into one PDF.",
    category: "convert",
    runtime: "client",
    status: "live",
    wave: 3,
    accepts: ["image/webp"],
    primaryKeyword: "webp to pdf",
    relatedSlugs: ["/png-to-pdf", "/jpg-to-pdf", "/heic-to-pdf", "/bmp-to-pdf"],
    guideSlug: "how-to-turn-iphone-photos-into-a-pdf",
    howTo: [
      { name: "Drop WebPs", text: "Pick one or many WebP files." },
      { name: "Order pages", text: "Drag to reorder. Set the page size." },
      { name: "Download PDF", text: "Click Make PDF to download." },
    ],
    faqs: [
      {
        q: "Are my files uploaded?",
        a: "No. Conversion runs entirely in your browser.",
      },
      {
        q: "Does this preserve quality?",
        a: "Modern WebPs are decoded losslessly by your browser, then embedded as JPEG (visually identical for photos; lossless WebPs see minor recompression).",
      },
      {
        q: "Can I mix WebP with JPG or PNG?",
        a: "Yes — drop them all in.",
      },
      {
        q: "Page size?",
        a: "Choose A4, Letter, or fit-to-image.",
      },
      {
        q: "Animated WebP?",
        a: "Only the first frame is used.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/bmp-to-pdf",
    name: "BMP to PDF",
    h1: "Convert BMP images to PDF",
    title: "BMP to PDF Online Free — No Signup",
    description:
      "Combine BMP bitmaps into a single PDF in your browser. Reorder, choose page size, no upload required.",
    shortDescription: "Combine BMP images into one PDF.",
    category: "convert",
    runtime: "client",
    status: "live",
    wave: 3,
    accepts: ["image/bmp"],
    primaryKeyword: "bmp to pdf",
    relatedSlugs: ["/png-to-pdf", "/jpg-to-pdf", "/webp-to-pdf", "/gif-to-pdf"],
    guideSlug: "how-to-turn-iphone-photos-into-a-pdf",
    howTo: [
      { name: "Drop BMPs", text: "Pick one or many BMP files." },
      { name: "Order pages", text: "Drag to reorder. Set the page size." },
      { name: "Download PDF", text: "Click Make PDF to download." },
    ],
    faqs: [
      {
        q: "Are my files uploaded?",
        a: "No. Conversion runs in your browser.",
      },
      {
        q: "Why is BMP rare?",
        a: "BMP is uncompressed. Files are large, but the decode is exact — every pixel survives.",
      },
      {
        q: "Page size?",
        a: "Choose A4, Letter, or fit-to-image.",
      },
      {
        q: "Compression after conversion?",
        a: "BMPs are converted to JPEG inside the PDF for reasonable file size.",
      },
      {
        q: "Mix with other formats?",
        a: "Yes — JPG, PNG, WebP, GIF all in one PDF.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
  {
    slug: "/gif-to-pdf",
    name: "GIF to PDF",
    h1: "Convert GIF images to PDF",
    title: "GIF to PDF Online Free — No Signup",
    description:
      "Combine GIF images into a single PDF in your browser. Reorder, choose page size, no upload required.",
    shortDescription: "Combine GIF images into one PDF.",
    category: "convert",
    runtime: "client",
    status: "live",
    wave: 3,
    accepts: ["image/gif"],
    primaryKeyword: "gif to pdf",
    relatedSlugs: ["/png-to-pdf", "/jpg-to-pdf", "/webp-to-pdf", "/bmp-to-pdf"],
    guideSlug: "how-to-turn-iphone-photos-into-a-pdf",
    howTo: [
      { name: "Drop GIFs", text: "Pick one or many GIF files." },
      { name: "Order pages", text: "Drag to reorder. Set the page size." },
      { name: "Download PDF", text: "Click Make PDF to download." },
    ],
    faqs: [
      {
        q: "Animated GIFs?",
        a: "We use the first frame. PDFs don't natively support animation; for animated content, screen-record and use the resulting MP4.",
      },
      {
        q: "Are my files uploaded?",
        a: "No.",
      },
      {
        q: "Transparency?",
        a: "PDF pages don't have transparency — transparent pixels are composited onto white.",
      },
      {
        q: "Page size?",
        a: "Choose A4, Letter, or fit-to-image.",
      },
      {
        q: "Mix with other formats?",
        a: "Yes.",
      },
    ],
    privacyLine: CLIENT_PRIVACY,
  },
];

/* ─────────────── Helpers ─────────────── */

export function getTool(slug: string): Tool | undefined {
  const normalized = slug.startsWith("/") ? slug : `/${slug}`;
  return tools.find((t) => t.slug === normalized);
}

export function relatedTools(slug: string, max = 4): Tool[] {
  const tool = getTool(slug);
  if (!tool) return [];
  const explicit = tool.relatedSlugs
    .map(getTool)
    .filter((t): t is Tool => Boolean(t));
  if (explicit.length >= max) return explicit.slice(0, max);

  // Fill from same category
  const filler = tools.filter(
    (t) =>
      t.slug !== tool.slug &&
      t.category === tool.category &&
      !explicit.includes(t),
  );
  return [...explicit, ...filler].slice(0, max);
}

export const categoryMeta: Record<
  ToolCategory,
  { label: string; tagline: string }
> = {
  forms: {
    label: "Forms",
    tagline: "Fill, build, and manage PDF forms.",
  },
  convert: {
    label: "Convert",
    tagline: "Turn images and other files into PDFs.",
  },
  security: {
    label: "Security",
    tagline: "Password-protect and unlock PDFs.",
  },
  edit: {
    label: "Edit",
    tagline: "Annotate, redact, and watermark.",
  },
  sign: {
    label: "Sign",
    tagline: "Add a signature to any PDF.",
  },
  ocr: {
    label: "OCR & Text",
    tagline: "Extract or search text in scanned PDFs.",
  },
};

export const allCategories: ToolCategory[] = [
  "forms",
  "convert",
  "security",
  "edit",
  "sign",
  "ocr",
];

export function toolsByCategory(): Record<ToolCategory, Tool[]> {
  const map = {} as Record<ToolCategory, Tool[]>;
  for (const c of allCategories) map[c] = [];
  for (const t of tools) map[t.category].push(t);
  return map;
}

// Curated "popular" row for the homepage — registry-driven by slug
const POPULAR_SLUGS = [
  "/heic-to-pdf",
  "/fill-pdf",
  "/sign-pdf",
  "/unlock-pdf",
  "/redact-pdf",
  "/png-to-pdf",
];

export function popularTools(): Tool[] {
  return POPULAR_SLUGS.map(getTool).filter((t): t is Tool => Boolean(t));
}
