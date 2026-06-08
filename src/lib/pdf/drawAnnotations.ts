import type { PdfBytes } from "./types";

/** Rect coordinates in PDF user space (origin bottom-left, 1pt = 1/72"). */
export interface PdfRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnnotationSpec =
  | {
      kind: "highlight";
      page: number;
      rect: PdfRect;
      /** Hex color, e.g. "#fff176". Defaults to yellow. */
      color?: string;
      /** 0..1, defaults to 0.4. */
      opacity?: number;
    }
  | {
      kind: "text";
      page: number;
      /** Bottom-left anchor of the text baseline in PDF coords. */
      x: number;
      y: number;
      text: string;
      /** Defaults to 14. */
      size?: number;
      /** Hex color. Defaults to black. */
      color?: string;
    }
  | {
      kind: "rect";
      page: number;
      rect: PdfRect;
      /** Stroke color. */
      color?: string;
      /** Stroke width in points. Defaults to 1.5. */
      strokeWidth?: number;
    }
  | {
      kind: "ellipse";
      page: number;
      rect: PdfRect;
      color?: string;
      strokeWidth?: number;
    }
  | {
      kind: "path";
      page: number;
      /** Series of points in PDF user space describing a freehand line. */
      points: { x: number; y: number }[];
      color?: string;
      strokeWidth?: number;
    };

function parseHex(hex?: string): [number, number, number] {
  if (!hex) return [0, 0, 0];
  const m = hex.replace("#", "");
  const norm =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const r = parseInt(norm.slice(0, 2), 16) / 255;
  const g = parseInt(norm.slice(2, 4), 16) / 255;
  const b = parseInt(norm.slice(4, 6), 16) / 255;
  return [
    Number.isFinite(r) ? r : 0,
    Number.isFinite(g) ? g : 0,
    Number.isFinite(b) ? b : 0,
  ];
}

/**
 * Bake annotations into the page content stream via pdf-lib. The
 * annotations become first-class drawn primitives — they survive a
 * round-trip through any PDF reader and are visible in print output.
 *
 * For reversible markup (annotations a reader can hide/show), a
 * separate AcroAnnotations path would be needed. v1 ships baked-in.
 */
export async function drawAnnotations(
  file: PdfBytes,
  items: AnnotationSpec[],
): Promise<PdfBytes> {
  const { PDFDocument, rgb, StandardFonts, degrees } = await import("pdf-lib");
  void degrees;
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();

  for (const item of items) {
    const page = pages[item.page];
    if (!page) continue;
    if (item.kind === "highlight") {
      const [r, g, b] = parseHex(item.color ?? "#fff176");
      page.drawRectangle({
        x: item.rect.x,
        y: item.rect.y,
        width: item.rect.width,
        height: item.rect.height,
        color: rgb(r, g, b),
        opacity: item.opacity ?? 0.4,
      });
    } else if (item.kind === "text") {
      const [r, g, b] = parseHex(item.color);
      page.drawText(item.text, {
        x: item.x,
        y: item.y,
        size: item.size ?? 14,
        font: helvetica,
        color: rgb(r, g, b),
      });
    } else if (item.kind === "rect") {
      const [r, g, b] = parseHex(item.color);
      page.drawRectangle({
        x: item.rect.x,
        y: item.rect.y,
        width: item.rect.width,
        height: item.rect.height,
        borderColor: rgb(r, g, b),
        borderWidth: item.strokeWidth ?? 1.5,
      });
    } else if (item.kind === "ellipse") {
      const [r, g, b] = parseHex(item.color);
      const cx = item.rect.x + item.rect.width / 2;
      const cy = item.rect.y + item.rect.height / 2;
      page.drawEllipse({
        x: cx,
        y: cy,
        xScale: item.rect.width / 2,
        yScale: item.rect.height / 2,
        borderColor: rgb(r, g, b),
        borderWidth: item.strokeWidth ?? 1.5,
      });
    } else if (item.kind === "path") {
      const [r, g, b] = parseHex(item.color);
      const width = item.strokeWidth ?? 1.5;
      for (let i = 1; i < item.points.length; i++) {
        const a = item.points[i - 1]!;
        const c = item.points[i]!;
        page.drawLine({
          start: { x: a.x, y: a.y },
          end: { x: c.x, y: c.y },
          color: rgb(r, g, b),
          thickness: width,
        });
      }
    }
  }
  return doc.save();
}
