import { beforeAll, describe, expect, it } from "vitest";
import { placeSignature } from "./placeSignature";

async function blankPdf(pages = 2): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([400, 400]);
  return doc.save();
}

const PNG_1X1 = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=",
    "base64",
  ),
);

const JPG_1X1 = Uint8Array.from(
  Buffer.from(
    "/9j/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AB//Z",
    "base64",
  ),
);

describe("placeSignature", () => {
  let pdf: Uint8Array;

  beforeAll(async () => {
    pdf = await blankPdf(2);
  });

  it("places a PNG signature and produces a valid PDF", async () => {
    const out = await placeSignature(pdf, [
      {
        page: 0,
        x: 100,
        y: 100,
        width: 120,
        height: 40,
        imageBytes: PNG_1X1,
        mime: "image/png",
      },
    ]);
    expect(out[0]).toBe(0x25); // %
    expect(out[1]).toBe(0x50); // P
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("places a JPG signature on a specific page", async () => {
    const out = await placeSignature(pdf, [
      {
        page: 1,
        x: 0,
        y: 0,
        width: 60,
        height: 30,
        imageBytes: JPG_1X1,
        mime: "image/jpeg",
      },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("places multiple signatures across pages", async () => {
    const out = await placeSignature(pdf, [
      {
        page: 0,
        x: 50,
        y: 50,
        width: 80,
        height: 30,
        imageBytes: PNG_1X1,
        mime: "image/png",
      },
      {
        page: 1,
        x: 50,
        y: 50,
        width: 80,
        height: 30,
        imageBytes: PNG_1X1,
        mime: "image/png",
      },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("out-of-range page is skipped silently", async () => {
    const out = await placeSignature(pdf, [
      {
        page: 99,
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        imageBytes: PNG_1X1,
        mime: "image/png",
      },
    ]);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });

  it("no placements → round-trip", async () => {
    const out = await placeSignature(pdf, []);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
  });
});
