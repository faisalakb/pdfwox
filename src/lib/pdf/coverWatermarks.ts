import type { PdfBytes } from "./types";

export interface CoverRect {
  page: number;
  /** PDF user-space rect (origin bottom-left). */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Padding around the rect to make sure descenders / ascenders are covered. */
  padding?: number;
}

export interface CoverWatermarksOptions {
  /** Hex color of the cover rect. Default white. */
  color?: string;
}

function parseHex(hex?: string): [number, number, number] {
  if (!hex) return [1, 1, 1];
  const m = hex.replace("#", "");
  const norm =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  return [
    parseInt(norm.slice(0, 2), 16) / 255,
    parseInt(norm.slice(2, 4), 16) / 255,
    parseInt(norm.slice(4, 6), 16) / 255,
  ];
}

/**
 * Cover a set of rectangles with a solid color. The "best-effort" remove
 * pass: we don't surgically edit the page content stream (pdf-lib doesn't
 * expose that), but we *do* draw an opaque rectangle in the same coords
 * as the watermark text. The original objects survive in the file —
 * critically, the underlying text is still selectable in some readers if
 * the cover rect happens to use a non-opaque color.
 *
 * For true removal (no text underneath), pair this with the redact
 * tool's page-rasterization path. The remove-watermark tool surfaces
 * that option explicitly when the user wants the strongest guarantee.
 */
export async function coverWatermarks(
  file: PdfBytes,
  rects: CoverRect[],
  opts: CoverWatermarksOptions = {},
): Promise<PdfBytes> {
  if (rects.length === 0) {
    const { PDFDocument } = await import("pdf-lib");
    const src = await PDFDocument.load(file, { ignoreEncryption: true });
    return src.save();
  }
  const { PDFDocument, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const pages = doc.getPages();
  const [r, g, b] = parseHex(opts.color);

  for (const rect of rects) {
    const page = pages[rect.page];
    if (!page) continue;
    const pad = rect.padding ?? 2;
    page.drawRectangle({
      x: rect.x - pad,
      y: rect.y - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
      color: rgb(r, g, b),
    });
  }
  return doc.save();
}
