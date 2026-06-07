import type { PdfBytes } from "./types";

/**
 * Re-save a PDF without its open password. Only works for files
 * the user has the password to — this is NOT a cracker.
 */
export async function unlock(
  file: PdfBytes,
  password: string,
): Promise<PdfBytes> {
  const { PDFDocument } = await import("pdf-lib");
  // @ts-expect-error — pdf-lib accepts password via options but its
  // public types only added it recently; runtime supports it.
  const src = await PDFDocument.load(file, { password });
  // Round-trip through a fresh document so any owner restrictions
  // on the source are also dropped.
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices());
  for (const p of pages) out.addPage(p);
  return out.save();
}
