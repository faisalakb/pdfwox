import type { ImageItem, ImagesToPdfOptions, PdfBytes } from "./types";

/**
 * Combine images into a single PDF. Worker-safe — accepts PNG/JPG bytes.
 * HEIC decoding happens on the main thread via `heicDecode.ts` before
 * the items reach this function.
 */

const A4 = [595.28, 841.89] as const; // points
const LETTER = [612, 792] as const;

function pageDims(opts: ImagesToPdfOptions, imgW: number, imgH: number) {
  if (opts.pageSize === "Fit") return [imgW, imgH] as const;
  return opts.pageSize === "Letter" ? LETTER : A4;
}

function marginInset(opts: ImagesToPdfOptions): number {
  switch (opts.margin) {
    case "none":
      return 0;
    case "narrow":
      return 18;
    case "normal":
      return 36;
  }
}

export async function imagesToPdf(
  items: ImageItem[],
  opts: ImagesToPdfOptions,
): Promise<PdfBytes> {
  if (items.length === 0) throw new Error("imagesToPdf: no images");

  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  for (const item of items) {
    if (item.mime !== "image/png" && item.mime !== "image/jpeg") {
      throw new Error(`imagesToPdf: unsupported mime "${item.mime}"`);
    }

    const img =
      item.mime === "image/png"
        ? await doc.embedPng(item.bytes)
        : await doc.embedJpg(item.bytes);

    const [pw, ph] = pageDims(opts, img.width, img.height);
    const page = doc.addPage([pw, ph]);
    const inset = marginInset(opts);
    const availW = pw - inset * 2;
    const availH = ph - inset * 2;
    const scale = Math.min(availW / img.width, availH / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    page.drawImage(img, {
      x: (pw - w) / 2,
      y: (ph - h) / 2,
      width: w,
      height: h,
    });
  }

  return doc.save();
}
