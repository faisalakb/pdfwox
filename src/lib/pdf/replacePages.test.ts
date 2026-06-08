import { beforeAll, describe, expect, it } from "vitest";
import { replacePages } from "./replacePages";

const SECRET = "TOPSECRETMARKER";
const KEEP = "PUBLICTEXTKEEP";

async function makeTextPdf(): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const page1 = doc.addPage([400, 400]);
  page1.drawText(SECRET, {
    x: 50,
    y: 350,
    size: 16,
    font,
    color: rgb(0, 0, 0),
  });

  const page2 = doc.addPage([400, 400]);
  page2.drawText(KEEP, { x: 50, y: 350, size: 16, font, color: rgb(0, 0, 0) });

  return doc.save();
}

// Minimal 1x1 black PNG (replacement raster stand-in).
const BLACK_PNG = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=",
    "base64",
  ),
);

async function extractTextOfPage(
  bytes: Uint8Array,
  pageIndex: number,
): Promise<string> {
  // pdf.js's getTextContent works in Node without a canvas — we only
  // read the text layer. This is the exact API an attacker would use.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const content = await page.getTextContent();
  return content.items
    .map((it: unknown) => (it as { str?: string }).str ?? "")
    .join(" ");
}

describe("replacePages (the redaction primitive)", () => {
  let pdf: Uint8Array;

  beforeAll(async () => {
    pdf = await makeTextPdf();
  });

  it("redacted page contains NO extractable text — including the secret", async () => {
    // Sanity check the secret is extractable before redaction.
    const before = await extractTextOfPage(pdf, 0);
    expect(before).toContain(SECRET);

    const out = await replacePages(pdf, [
      { pageIndex: 0, imageBytes: BLACK_PNG, mime: "image/png" },
    ]);

    const after = await extractTextOfPage(out, 0);
    // The exact failure mode we're guarding against: black box on top,
    // text still extractable. With a true page replacement, the text
    // string must not appear in pdf.js's getTextContent output.
    expect(after).not.toContain(SECRET);
    expect(after.trim()).toBe("");
  });

  it("untouched page keeps its vector text", async () => {
    const out = await replacePages(pdf, [
      { pageIndex: 0, imageBytes: BLACK_PNG, mime: "image/png" },
    ]);
    const keep = await extractTextOfPage(out, 1);
    expect(keep).toContain(KEEP);
  });

  it("preserves page dimensions of the original", async () => {
    const out = await replacePages(pdf, [
      { pageIndex: 0, imageBytes: BLACK_PNG, mime: "image/png" },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const reloaded = await PDFDocument.load(out);
    const { width, height } = reloaded.getPage(0).getSize();
    expect(width).toBe(400);
    expect(height).toBe(400);
  });

  it("no replacements → output is a round-tripped copy", async () => {
    const out = await replacePages(pdf, []);
    const text = await extractTextOfPage(out, 0);
    expect(text).toContain(SECRET);
  });
});
