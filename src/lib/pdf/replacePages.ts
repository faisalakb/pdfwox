import type { PdfBytes } from "./types";

export interface PageReplacement {
  /** 0-indexed source page to replace. */
  pageIndex: number;
  /** Raster bytes for the replacement page. */
  imageBytes: Uint8Array;
  /** "image/png" | "image/jpeg" */
  mime: string;
}

/**
 * Replace selected pages of a PDF with raster images. This is what makes
 * redaction *actually* remove the underlying text — once a page is a
 * single embedded image, there's nothing left for `getTextContent` to
 * find, regardless of how the original page was structured.
 *
 * Pages without a replacement entry are copied through unchanged, so
 * the output keeps its vector content (and selectable text) on every
 * page that didn't get redacted.
 */
export async function replacePages(
  file: PdfBytes,
  replacements: PageReplacement[],
): Promise<PdfBytes> {
  if (replacements.length === 0) {
    // Nothing to do — but still round-trip through pdf-lib so the caller
    // gets a consistent output.
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(file, { ignoreEncryption: true });
    return src.save();
  }
  const { PDFDocument } = await import("pdf-lib");
  const src = await PDFDocument.load(file, { ignoreEncryption: true });
  const out = await PDFDocument.create();

  const byIndex = new Map<number, PageReplacement>();
  for (const r of replacements) byIndex.set(r.pageIndex, r);

  const sourcePageCount = src.getPageCount();
  for (let i = 0; i < sourcePageCount; i++) {
    const replacement = byIndex.get(i);
    if (replacement) {
      // Match the original page size so layout stays consistent.
      const srcPage = src.getPage(i);
      const { width, height } = srcPage.getSize();
      const image =
        replacement.mime === "image/png"
          ? await out.embedPng(replacement.imageBytes)
          : await out.embedJpg(replacement.imageBytes);
      const page = out.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
    } else {
      const [copied] = await out.copyPages(src, [i]);
      if (copied) out.addPage(copied);
    }
  }
  return out.save();
}
