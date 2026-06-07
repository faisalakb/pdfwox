import type { PdfBytes, ProgressFn } from "./types";

/**
 * Merge multiple PDFs into one. Pure: in Uint8Array[], out Uint8Array.
 * pdf-lib is dynamic-imported so this module can load in jsdom tests
 * without touching the heavy library until it's actually needed.
 */
export async function merge(
  files: PdfBytes[],
  onProgress?: ProgressFn,
): Promise<PdfBytes> {
  if (files.length === 0) throw new Error("merge: no files");
  const { PDFDocument } = await import("pdf-lib");

  const out = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const src = await PDFDocument.load(files[i], { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
    onProgress?.((i + 1) / files.length);
  }
  return out.save();
}
