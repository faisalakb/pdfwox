import { beforeAll, describe, expect, it } from "vitest";
import { addFields } from "./addFields";
import { inspectForm } from "./inspect";

async function blankPdf(pageCount = 1): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 400]);
  return doc.save();
}

describe("addFields", () => {
  let blank: Uint8Array;

  beforeAll(async () => {
    blank = await blankPdf(2);
  });

  it("adds a text field that inspectForm finds", async () => {
    const out = await addFields(blank, [
      {
        name: "fullname",
        type: "text",
        page: 0,
        rect: { x: 40, y: 320, width: 200, height: 24 },
      },
    ]);
    const fields = await inspectForm(out);
    expect(fields.length).toBe(1);
    expect(fields[0]?.name).toBe("fullname");
    expect(fields[0]?.type).toBe("text");
  });

  it("adds multiple fields of different types", async () => {
    const out = await addFields(blank, [
      {
        name: "first",
        type: "text",
        page: 0,
        rect: { x: 40, y: 320, width: 200, height: 24 },
      },
      {
        name: "subscribe",
        type: "checkbox",
        page: 0,
        rect: { x: 40, y: 280, width: 16, height: 16 },
      },
      {
        name: "signature",
        type: "signature",
        page: 1,
        rect: { x: 40, y: 100, width: 240, height: 60 },
      },
    ]);
    const fields = await inspectForm(out);
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
    expect(byName.first?.type).toBe("text");
    expect(byName.subscribe?.type).toBe("checkbox");
    expect(byName.signature?.type).toBe("text"); // signature stub
  });

  it("rejects out-of-range page", async () => {
    await expect(
      addFields(blank, [
        {
          name: "x",
          type: "text",
          page: 99,
          rect: { x: 0, y: 0, width: 10, height: 10 },
        },
      ]),
    ).rejects.toThrow(/out of range/);
  });
});
