import { beforeAll, describe, expect, it } from "vitest";
import { merge } from "./merge";

async function makePdf(pageCount: number): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 400]);
  return doc.save();
}

describe("merge", () => {
  let two: Uint8Array;
  let three: Uint8Array;

  beforeAll(async () => {
    two = await makePdf(2);
    three = await makePdf(3);
  });

  it("sums page counts of inputs", async () => {
    const out = await merge([two, three]);
    const { PDFDocument } = await import("pdf-lib");
    const loaded = await PDFDocument.load(out);
    expect(loaded.getPageCount()).toBe(5);
  });

  it("emits monotonic progress 0..1", async () => {
    const progress: number[] = [];
    await merge([two, three], (p) => progress.push(p));
    expect(progress.length).toBe(2);
    expect(progress[0]).toBeGreaterThan(0);
    expect(progress[progress.length - 1]).toBe(1);
    for (let i = 1; i < progress.length; i++) {
      expect(progress[i]).toBeGreaterThanOrEqual(progress[i - 1]);
    }
  });

  it("throws on empty input", async () => {
    await expect(merge([])).rejects.toThrow();
  });
});
