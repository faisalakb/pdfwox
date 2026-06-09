import type { PdfBytes } from "./types";

export interface SignaturePlacement {
  /** 0-indexed page. */
  page: number;
  /** PDF user-space rect (origin bottom-left). */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Signature image bytes. */
  imageBytes: Uint8Array;
  /** "image/png" or "image/jpeg". PNG is preferred for transparent strokes. */
  mime: "image/png" | "image/jpeg";
}

/**
 * Place one or more signature images onto a PDF and return the saved bytes.
 *
 * The signature becomes part of the page content stream — it survives in
 * any reader, prints correctly, and is not a separate annotation a
 * recipient can hide/show.
 */
export async function placeSignature(
  file: PdfBytes,
  placements: SignaturePlacement[],
): Promise<PdfBytes> {
  if (placements.length === 0) {
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(file, { ignoreEncryption: true });
    return src.save();
  }
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const pages = doc.getPages();

  for (const p of placements) {
    const page = pages[p.page];
    if (!page) continue;
    const image =
      p.mime === "image/png"
        ? await doc.embedPng(p.imageBytes)
        : await doc.embedJpg(p.imageBytes);
    page.drawImage(image, {
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
    });
  }
  return doc.save();
}
