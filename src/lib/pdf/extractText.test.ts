import { beforeAll, describe, expect, it } from "vitest";
import { extractText } from "./extractText";

async function textPdf(): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const p1 = doc.addPage([400, 400]);
  p1.drawText("Hello world", {
    x: 40,
    y: 350,
    size: 16,
    font,
    color: rgb(0, 0, 0),
  });
  p1.drawText("More content on page one to push past the scan threshold.", {
    x: 40,
    y: 320,
    size: 12,
    font,
  });
  const p2 = doc.addPage([400, 400]);
  p2.drawText("Second page text content that exceeds the scan threshold.", {
    x: 40,
    y: 350,
    size: 12,
    font,
  });
  return doc.save();
}

async function blankPdf(pages = 2): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([400, 400]);
  return doc.save();
}

describe("extractText", () => {
  let withText: Uint8Array;
  let blank: Uint8Array;

  beforeAll(async () => {
    withText = await textPdf();
    blank = await blankPdf(2);
  });

  it("returns one entry per page with text content", async () => {
    const result = await extractText(withText);
    expect(result.pages.length).toBe(2);
    expect(result.pages[0]?.text).toContain("Hello world");
    expect(result.pages[1]?.text).toContain("Second page");
  });

  it("fullText joins pages with double newlines", async () => {
    const result = await extractText(withText);
    expect(result.fullText).toContain("Hello world");
    expect(result.fullText).toContain("Second page");
    expect(result.fullText.split("\n\n").length).toBeGreaterThanOrEqual(2);
  });

  it("likelyScan is false for a text PDF", async () => {
    const result = await extractText(withText);
    expect(result.likelyScan).toBe(false);
  });

  it("likelyScan is true for a blank PDF (no extractable text)", async () => {
    const result = await extractText(blank);
    expect(result.likelyScan).toBe(true);
    expect(result.fullText.trim()).toBe("");
  });
});
