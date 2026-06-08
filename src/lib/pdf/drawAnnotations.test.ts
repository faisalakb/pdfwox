import { beforeAll, describe, expect, it } from "vitest";
import { drawAnnotations } from "./drawAnnotations";

async function blankPdf(): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  doc.addPage([400, 400]);
  return doc.save();
}

async function extractText(
  bytes: Uint8Array,
  pageIndex: number,
): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const content = await page.getTextContent();
  return content.items
    .map((it: unknown) => (it as { str?: string }).str ?? "")
    .join(" ");
}

describe("drawAnnotations", () => {
  let pdf: Uint8Array;

  beforeAll(async () => {
    pdf = await blankPdf();
  });

  it("text annotation is extractable from the right page", async () => {
    const out = await drawAnnotations(pdf, [
      { kind: "text", page: 0, x: 50, y: 200, text: "Hello world", size: 18 },
    ]);
    expect(await extractText(out, 0)).toContain("Hello world");
    expect(await extractText(out, 1)).not.toContain("Hello world");
  });

  it("highlight + shapes load without errors and keep the PDF parseable", async () => {
    const out = await drawAnnotations(pdf, [
      {
        kind: "highlight",
        page: 0,
        rect: { x: 30, y: 300, width: 200, height: 24 },
        color: "#fff176",
      },
      {
        kind: "rect",
        page: 0,
        rect: { x: 30, y: 250, width: 200, height: 24 },
        color: "#1d6b54",
      },
      {
        kind: "ellipse",
        page: 0,
        rect: { x: 30, y: 200, width: 200, height: 24 },
        color: "#b3261e",
      },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("path renders without throwing", async () => {
    const out = await drawAnnotations(pdf, [
      {
        kind: "path",
        page: 0,
        points: [
          { x: 30, y: 30 },
          { x: 60, y: 60 },
          { x: 90, y: 30 },
        ],
        strokeWidth: 2,
      },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("targeting an out-of-range page is skipped silently", async () => {
    const out = await drawAnnotations(pdf, [
      { kind: "text", page: 99, x: 0, y: 0, text: "ghost" },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});
