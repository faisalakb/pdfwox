import { beforeAll, describe, expect, it } from "vitest";
import { addWatermark } from "./addWatermark";

async function blankPdf(pages = 3): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([400, 400]);
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

// 1x1 PNG used as the image-watermark fixture.
const ONE_PX_PNG = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=",
    "base64",
  ),
);

describe("addWatermark", () => {
  let pdf: Uint8Array;

  beforeAll(async () => {
    pdf = await blankPdf(3);
  });

  it("text watermark applies to every page by default", async () => {
    const out = await addWatermark(pdf, {
      source: { kind: "text", text: "DRAFT" },
    });
    for (let p = 0; p < 3; p++) {
      expect(await extractText(out, p)).toContain("DRAFT");
    }
  });

  it("page range restricts which pages get the watermark", async () => {
    const out = await addWatermark(pdf, {
      source: { kind: "text", text: "ONLYP1" },
      pageRange: { from: 0, to: 0 },
    });
    expect(await extractText(out, 0)).toContain("ONLYP1");
    expect(await extractText(out, 1)).not.toContain("ONLYP1");
    expect(await extractText(out, 2)).not.toContain("ONLYP1");
  });

  it("tiling produces multiple copies on the same page", async () => {
    const out = await addWatermark(pdf, {
      source: { kind: "text", text: "TILE" },
      tile: true,
    });
    const text = await extractText(out, 0);
    const occurrences = text.match(/TILE/g)?.length ?? 0;
    expect(occurrences).toBeGreaterThan(3);
  });

  it("image watermark embeds without throwing and produces a parseable PDF", async () => {
    const out = await addWatermark(pdf, {
      source: {
        kind: "image",
        bytes: ONE_PX_PNG,
        mime: "image/png",
        width: 100,
      },
      position: "bottom-right",
      opacity: 0.5,
    });
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(3);
  });

  it("9 positions all draw without error", async () => {
    const positions = [
      "top-left",
      "top-center",
      "top-right",
      "middle-left",
      "center",
      "middle-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
    ] as const;
    for (const position of positions) {
      const out = await addWatermark(pdf, {
        source: { kind: "text", text: `P_${position}`, size: 10 },
        position,
      });
      expect(await extractText(out, 0)).toContain(`P_${position}`);
    }
  });
});
