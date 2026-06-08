import type { PdfBytes } from "./types";

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface TextWatermark {
  kind: "text";
  text: string;
  /** Hex color. Default "#1a1a1f". */
  color?: string;
  /** Font size in points. Default 48. */
  size?: number;
  /** Bold? Default false (uses Helvetica vs HelveticaBold). */
  bold?: boolean;
}

export interface ImageWatermark {
  kind: "image";
  /** Image bytes. */
  bytes: Uint8Array;
  /** "image/png" or "image/jpeg". */
  mime: "image/png" | "image/jpeg";
  /** Width in points. Height scales to keep aspect ratio. Default 200. */
  width?: number;
}

export interface AddWatermarkSpec {
  source: TextWatermark | ImageWatermark;
  /** 0..1 — defaults to 0.25. */
  opacity?: number;
  /** Rotation in degrees, counter-clockwise. Default 0; tiling uses 45 unless overridden. */
  rotation?: number;
  /** Where on the page to anchor the watermark. Default "center". */
  position?: WatermarkPosition;
  /** Repeat across the page in a diagonal tile pattern. */
  tile?: boolean;
  /** 0-indexed inclusive range. Defaults to all pages. */
  pageRange?: { from: number; to: number };
}

function anchorXY(
  pos: WatermarkPosition,
  pageW: number,
  pageH: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const padX = 36;
  const padY = 36;
  const left = padX;
  const right = pageW - w - padX;
  const cx = (pageW - w) / 2;
  const top = pageH - h - padY;
  const middle = (pageH - h) / 2;
  const bottom = padY;
  switch (pos) {
    case "top-left":
      return { x: left, y: top };
    case "top-center":
      return { x: cx, y: top };
    case "top-right":
      return { x: right, y: top };
    case "middle-left":
      return { x: left, y: middle };
    case "center":
      return { x: cx, y: middle };
    case "middle-right":
      return { x: right, y: middle };
    case "bottom-left":
      return { x: left, y: bottom };
    case "bottom-center":
      return { x: cx, y: bottom };
    case "bottom-right":
      return { x: right, y: bottom };
  }
}

function parseHex(hex?: string): [number, number, number] {
  if (!hex) return [0.1, 0.1, 0.12];
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
 * Draw a text or image watermark onto a PDF and return the saved bytes.
 *
 * The watermark is baked into the page content stream — it survives any
 * reader and is part of print output. To preserve the option of a future
 * "remove watermark" pass, callers can also detect this PDF's text via
 * `detectWatermarks`.
 */
export async function addWatermark(
  file: PdfBytes,
  spec: AddWatermarkSpec,
): Promise<PdfBytes> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const pages = doc.getPages();

  const opacity = spec.opacity ?? 0.25;
  const rotationDeg = spec.rotation ?? (spec.tile ? 30 : 0);
  const position = spec.position ?? "center";
  const range = spec.pageRange ?? { from: 0, to: pages.length - 1 };

  let font: import("pdf-lib").PDFFont | undefined;
  let image: import("pdf-lib").PDFImage | undefined;
  let textWidth = 0;
  let textHeight = 0;
  let imageWidth = 0;
  let imageHeight = 0;

  if (spec.source.kind === "text") {
    font = await doc.embedFont(
      spec.source.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica,
    );
    const size = spec.source.size ?? 48;
    textWidth = font.widthOfTextAtSize(spec.source.text, size);
    textHeight = font.heightAtSize(size);
  } else {
    image =
      spec.source.mime === "image/png"
        ? await doc.embedPng(spec.source.bytes)
        : await doc.embedJpg(spec.source.bytes);
    imageWidth = spec.source.width ?? 200;
    imageHeight = (image.height / image.width) * imageWidth;
  }

  const drawOne = (
    page: import("pdf-lib").PDFPage,
    x: number,
    y: number,
  ) => {
    if (spec.source.kind === "text" && font) {
      const [r, g, b] = parseHex(spec.source.color);
      page.drawText(spec.source.text, {
        x,
        y,
        size: spec.source.size ?? 48,
        font,
        color: rgb(r, g, b),
        opacity,
        rotate: degrees(rotationDeg),
      });
    } else if (spec.source.kind === "image" && image) {
      page.drawImage(image, {
        x,
        y,
        width: imageWidth,
        height: imageHeight,
        opacity,
        rotate: degrees(rotationDeg),
      });
    }
  };

  for (let i = range.from; i <= Math.min(range.to, pages.length - 1); i++) {
    const page = pages[i]!;
    const { width: pageW, height: pageH } = page.getSize();
    const w = spec.source.kind === "text" ? textWidth : imageWidth;
    const h = spec.source.kind === "text" ? textHeight : imageHeight;

    if (spec.tile) {
      // Diagonal tile — spaced ~1.5× the watermark's larger dimension.
      const step = Math.max(w, h) * 1.5;
      for (let y = -h; y < pageH + h; y += step) {
        for (let x = -w; x < pageW + w; x += step) {
          drawOne(page, x, y);
        }
      }
    } else {
      const { x, y } = anchorXY(position, pageW, pageH, w, h);
      drawOne(page, x, y);
    }
  }
  return doc.save();
}
