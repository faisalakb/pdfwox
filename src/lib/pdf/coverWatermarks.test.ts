import { beforeAll, describe, expect, it } from "vitest";
import { addWatermark } from "./addWatermark";
import { coverWatermarks } from "./coverWatermarks";

const MARKER = "DRAFTONLY";

async function pdfWithWatermark(): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const blank = await doc.save();
  return addWatermark(blank, {
    source: { kind: "text", text: MARKER, size: 36 },
    opacity: 0.4,
    position: "center",
  });
}

describe("coverWatermarks", () => {
  let watermarked: Uint8Array;

  beforeAll(async () => {
    watermarked = await pdfWithWatermark();
  });

  it("input has the watermark text before covering", async () => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({ data: new Uint8Array(watermarked) })
      .promise;
    const content = await (await doc.getPage(1)).getTextContent();
    const joined = content.items
      .map((it: unknown) => (it as { str?: string }).str ?? "")
      .join(" ");
    expect(joined).toContain(MARKER);
  });

  it("covers a rect and produces a valid PDF", async () => {
    const out = await coverWatermarks(watermarked, [
      { page: 0, x: 50, y: 180, width: 300, height: 40, padding: 4 },
    ]);
    expect(out[0]).toBe(0x25); // % of %PDF
    expect(out[1]).toBe(0x50);
    expect(out[2]).toBe(0x44);
    expect(out[3]).toBe(0x46);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });

  it("no rects → output is round-trip", async () => {
    const out = await coverWatermarks(watermarked, []);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });

  it("out-of-range page is skipped silently", async () => {
    const out = await coverWatermarks(watermarked, [
      { page: 99, x: 0, y: 0, width: 10, height: 10 },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(1);
  });
});
