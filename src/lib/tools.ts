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
  longDescription: string[];
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
    longDescription: [
      "PDF forms are everywhere — tax returns, rental agreements, job applications, insurance claims. When a form lands in your inbox, the last thing you want is to print it, write on it by hand, and scan it back. Fill PDF lets you open any PDF that has form fields directly in your browser and type into them just as you would in a desktop reader.",
      "Text fields, checkboxes, radio buttons, and dropdown lists are all supported. Tab through the fields in reading order, or click directly on any one. When you finish, you can optionally flatten the form before downloading — flattening converts every field into static content so the values are locked in and can't be altered by the recipient.",
      "Because everything happens inside the browser tab, the file never travels to a server. There is nothing to upload, no queue to wait in, and no account to sign in to. The tool continues to work offline once the page has loaded.",
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
    longDescription: [
      "A fillable PDF is a standard PDF document with interactive form fields embedded in it — text boxes, checkboxes, radio buttons, dropdowns, and signature areas. When a recipient opens it in any PDF reader, they see the same clean layout but can click directly into the fields and type their answers. Create Fillable PDF turns any static PDF into one of these interactive forms without requiring desktop software.",
      "The workflow is visual: upload your PDF, then drag rectangles over the regions where you want form fields. Each rectangle becomes a field you can configure — give it a name, set whether it is required, and choose the field type. Text areas can be single-line or multi-line. Signature fields prompt for a drawn or typed signature. When you save, the result is a standard AcroForm-compatible PDF that opens correctly in Adobe Acrobat, Preview, Chrome, and every other modern reader.",
      "HR teams use this to distribute onboarding paperwork, small businesses use it for client intake forms, and individuals use it to prepare forms they will send to others to fill in. Because the tool runs in your browser, the original PDF and the final form never pass through any server.",
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
    longDescription: [
      "iPhones and iPads default to HEIC — High Efficiency Image Container — because it stores photos at roughly half the file size of JPEG with equivalent visual quality. The problem is that Windows, most web services, and many PDF workflows don't recognise the format at all. HEIC to PDF solves this by converting your iPhone photos into a universally readable PDF document right inside the browser.",
      "You can drop a single photo or a batch of them. Once the files are loaded, drag the thumbnails to set the page order, then choose whether each page should be A4, US Letter, or fitted to the exact image dimensions. The conversion decodes the HEIC data locally using a WebAssembly library, so it works even in browsers that have no native HEIC support.",
      "The resulting PDF is a clean document you can email, upload to any service, or print. Because no files are sent to a server, images you'd rather keep private — medical photos, legal documents, personal records — stay on your device throughout the process.",
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
    longDescription: [
      "PNG is the go-to format for screenshots, interface mockups, diagrams, and any image where lossless quality matters. When you need to share several of these as a single document — a bug report, a design review, a proof of work — assembling them into a PDF is far more practical than sending a folder of loose image files. PNG to PDF combines any number of PNG images into a properly paginated PDF in seconds.",
      "Drop your files onto the page and rearrange them by dragging the thumbnails. Choose a page size — A4, Letter, or fit the page exactly to each image's dimensions — and then download the result. PNG's alpha transparency channel is handled automatically: transparent areas are composited onto a white background, since PDF pages do not support page-level transparency.",
      "The conversion runs entirely inside your browser. There is no server, no signup, and no file size limit other than what your device can handle in memory. Large batches are processed in a Web Worker to keep the page responsive while conversion runs.",
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
    longDescription: [
      "JPEG is the most widely used photo format on the planet. Cameras, phones, and scanners all produce JPG files by default, which makes it the obvious format when you need to combine photos into a shareable document. JPG to PDF packages any number of JPEG images into a single PDF without any quality loss — the original JPEG bytes are embedded directly rather than decoded and re-encoded.",
      "Load your photos, drag the thumbnails into the right order, set the page size, and optionally add a margin. The tool produces a multi-page PDF where each page contains one image. Page order matches exactly what you set, so you can arrange before-and-after shots, multi-page receipts, or photo sequences in any order you choose.",
      "Everything runs locally in the browser. No upload, no watermark, no file size restriction beyond what your device's memory can hold. JPEG embedding without re-encoding means a 4 MB photo stays 4 MB in the PDF — there is no second generation of compression.",
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
    longDescription: [
      "A password-protected PDF is useful when the document is in transit, but can become an inconvenience once it has reached the right hands. Opening the same file repeatedly means typing the password every time, and many services that accept PDF uploads refuse password-protected files outright. Unlock PDF removes the password from a PDF you already know the password for, producing a clean copy you can open freely.",
      "The tool works on user-open passwords — the kind you type to open the file. It also removes owner restrictions such as printing, copying, and editing bans, since those restrictions are tied to the same password credential. To use it, upload the protected PDF, type the password, and download the unlocked result. If the password is wrong, you will be told immediately.",
      "The file and the password are processed entirely within your browser using a WebAssembly build of the qpdf library. Neither the password nor any byte of the file is sent to any server. This also means the tool will not help with files whose passwords you do not know — it does not attempt to crack or brute-force anything.",
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
    longDescription: [
      "Sending a PDF that contains personal information, confidential terms, or financial data across email or a file-sharing link exposes it to anyone who intercepts or stumbles on the link. Adding an open password means only people you share the password with can read the file. Protect PDF encrypts the document with AES-256 — the same standard used by enterprise software — directly in your browser.",
      "Beyond the open password, you can set owner-level permission restrictions: prevent printing, block text copying, or disallow further modification. These restrictions are enforced by PDF readers that comply with the specification. For maximum security, pair a strong open password with the restrictions you need — the open password is what drives the encryption strength.",
      "Because encryption runs locally using a WebAssembly build of qpdf, the unprotected file never leaves your device. You set the password, you keep it. If you lose it, there is no recovery — so store it somewhere safe before sharing the protected document.",
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
    longDescription: [
      "Covering sensitive content with a black rectangle in a PDF editor is not the same as removing it. If the original text layer is still present under the box, anyone can select the covered area and copy the text out. True redaction requires that the underlying content be eliminated entirely. Redact PDF burns the selected regions into the page image using rasterization, so a copy-and-paste attack returns nothing.",
      "To redact, open the PDF and drag rectangles over every region you want to remove — names, account numbers, addresses, signatures, or images. The boxes are previewed as grey overlays so you can confirm exactly what is covered before you commit. Once you click Apply, the affected pages are rasterized and the source content is gone. The resulting PDF also has its document metadata stripped.",
      "Common use cases include preparing legal filings, sharing medical records with identifying information removed, publishing financial documents with account details hidden, and distributing contracts with third-party terms obscured. The entire redaction process runs in your browser, so the sensitive original content is never transmitted anywhere.",
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
    longDescription: [
      "Annotating a PDF means adding your own marks to the document without changing the original content. Reviewers highlight key passages before a meeting, editors leave comments on draft contracts, students underline important paragraphs, and collaborators draw attention to specific diagram regions. Annotate PDF gives you the standard annotation toolkit — highlight, underline, strikethrough, freehand drawing, and sticky notes — in a browser tab.",
      "Annotations are stored as standard PDF annotation objects, which means when the recipient opens the file in Adobe Acrobat, Apple Preview, or any other compliant reader, they see the same marks. Reviewers can reply to sticky notes in their own reader if they have a full PDF editor. You can also delete any annotation before exporting — select it in Edit mode and press Delete.",
      "Multi-page documents are fully supported. Navigate between pages, annotate whichever pages need markup, and export once. The finished PDF contains all annotations baked into the file as first-class objects. Because annotations are added locally in your browser, the document content is never sent to a server.",
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
    longDescription: [
      "Watermarks serve as a visual label on every page of a document — marking it as a draft, confidential, a proof copy, or associating it with a brand or author. Add Watermark to PDF stamps either a text string or an image onto every page, with full control over position, opacity, rotation, and tiling.",
      "For text watermarks, choose the font size, colour, and angle. A diagonal 'DRAFT' stamp across the centre is a few clicks. For image watermarks, upload a PNG (transparent backgrounds are respected) or a JPG logo. Place it in a corner as a branding mark, or tile it across the whole page at reduced opacity for a more thorough coverage pattern. You can restrict the watermark to specific page ranges if only some pages need marking.",
      "Watermarks are added as a content layer on top of the existing page, which keeps them easily visible and readable. Because the tool runs in your browser, confidential drafts are watermarked locally — the file content is never sent to an external service.",
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
    longDescription: [
      "Not every watermark can be removed, and this tool is honest about that. A watermark that was added as a separate content layer — text or an image drawn on top of the page — can be identified and deleted as a discrete object. A watermark that was flattened or rasterized into the page image is baked into the pixels and cannot be separated from the rest of the page content. Remove Watermark from PDF handles the first kind and tells you clearly when a watermark belongs to the second.",
      "Upload the file and the tool scans for detected overlay watermark objects. Detected watermarks are highlighted so you can confirm each one before removal. Select the watermarks you want gone and download a clean copy. The rest of the document — text, images, annotations — is untouched.",
      "Only use this on PDFs you own or have permission to modify. The tool is intended for removing watermarks from your own documents — such as a draft stamp you added yourself, or a 'Sample' mark on a proof — not for stripping watermarks from others' copyrighted material.",
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
    longDescription: [
      "Signing a PDF used to mean printing it, putting pen to paper, scanning it back, and emailing it as an attachment. Sign PDF compresses that to a single browser tab: upload the document, create your signature, place it on the page, and download the signed file. Three signature styles are supported — drawing with a mouse or finger, typing your name in a script font, or uploading a photo of your handwritten signature.",
      "Once a signature is created it can be dragged to any position on any page and resized to fit the signature line. Multiple signature placements are allowed, which is useful for documents that require initials on every page as well as a full signature at the end. Signatures are stored in browser local storage so you can reuse them across sessions without redrawing.",
      "This tool produces an electronic signature — a visible mark on the page. It is not a cryptographic digital signature with a certificate authority. Electronic signatures are legally recognised for most everyday contracts in many countries, but if your specific use case requires a certificate-based signature, you will need a dedicated signing service. For everything else — NDAs, rental agreements, offer letters — this tool handles it in under a minute.",
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
    longDescription: [
      "PDF to Text pulls the words out of a PDF and gives them back as a plain text file you can open in any editor, copy into another document, or feed into any workflow that expects text rather than a file format. Text-based PDFs — those created from Word, Google Docs, or any authoring tool — are parsed instantly without any additional processing. Scanned PDFs go through an OCR step automatically.",
      "When OCR is needed, Tesseract.js runs the recognition directly in your browser using WebAssembly. A small English language model (around 3 MB) is downloaded the first time and then cached. Each page of the scanned PDF is rendered as an image and fed through the OCR engine, which returns a text transcript. You can review and edit the extracted text in the page before downloading the final file.",
      "Plain text loses the visual layout — columns merge, tables flatten, and whitespace-based alignment disappears. If you need the text to stay searchable inside the original PDF rather than extracted separately, use the OCR PDF tool instead, which embeds the recognised text as a hidden layer under the original page image.",
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
    longDescription: [
      "A scanned PDF is just a collection of images — every page is a photograph of a document rather than actual text. You can't select a word, search for a phrase, or copy a paragraph because there is no text in the file, only pixels. OCR PDF fixes this by running optical character recognition on each page and embedding the recognised text as an invisible layer beneath the page image — a format known as a sandwich PDF.",
      "The visible page is completely unchanged: the same scanned image appears when you open the result in any PDF reader. But behind it, a transparent text layer now exists that your reader uses for search, selection, and copy-paste. Ctrl+F finds your keywords. You can highlight a sentence. Assistive technology can read the document aloud. The OCR engine is Tesseract.js, running in WebAssembly inside your browser tab.",
      "Accuracy depends on scan quality. Clean, high-contrast, straight pages typically reach 95% or better. Tilted, faded, or low-resolution scans return lower confidence. For the best results, scan at 300 DPI or higher with good lighting, and make sure the page is flat and square to the camera. Documents in languages other than English may see reduced accuracy with the default English model.",
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
    longDescription: [
      "WebP is a modern image format developed for the web. It delivers smaller file sizes than JPEG and PNG at equivalent visual quality, which is why browsers, design tools, and CMS platforms increasingly default to it for images. The drawback is that WebP is not universally accepted outside the browser — print workflows, document management systems, and many email clients expect JPEG or PDF rather than WebP. WebP to PDF bridges that gap.",
      "Drop one or more WebP files, arrange them in the order you want, and choose a page size. Lossless WebP images are decoded faithfully; lossy WebP images are converted to JPEG inside the PDF, which is visually identical to the source. Animated WebP files are handled by taking the first frame only, since PDF pages are static.",
      "You can combine WebP with other image formats in the same document — drop in a mix of WebP, JPG, PNG, or BMP and they will all be assembled into a single PDF in the sequence you set. The conversion runs in your browser with no file upload.",
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
    longDescription: [
      "BMP — Bitmap — is one of the oldest image formats in use. It stores pixel data without compression, which means every pixel is recorded exactly, with no quality loss whatsoever. That makes it common in certain technical and legacy workflows: screenshots from older Windows utilities, exports from scientific instruments, and output from older industrial imaging software often arrive as BMP files.",
      "BMP to PDF converts these uncompressed bitmaps into a PDF document that any modern reader can open. Because BMP files are large by nature, they are converted to JPEG inside the PDF to produce a practical file size, while maintaining visually equivalent quality. Arrange multiple BMPs into the order you need, choose your page dimensions, and download.",
      "Mixing BMP with other formats in the same PDF is supported — add JPG, PNG, or WebP files alongside your BMPs and they will all be combined in sequence. No upload is required; the entire conversion happens in your browser.",
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
    longDescription: [
      "GIF is a format most associated with short looping animations on the web, but it is also widely used for static images — diagrams, icons, screenshots, and graphics exported from older tools. GIF to PDF packages one or more GIF images into a single PDF document so they can be shared, printed, or archived in a universally readable format.",
      "Animated GIFs are handled by extracting the first frame, since PDF pages are static. Transparent GIF areas are composited onto a white background, because PDF pages do not support page-level transparency. Static GIFs are converted faithfully, preserving the full colour palette and pixel data.",
      "Drop multiple GIF files at once to build a multi-page PDF. Drag the thumbnails to set the page order, pick a page size — A4, Letter, or fit exactly to each image — and download the result. Mixing GIF with JPG, PNG, WebP, or BMP in the same document is supported. The conversion runs entirely in your browser.",
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
