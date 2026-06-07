import { beforeAll, describe, expect, it } from "vitest";
import { addFields } from "./addFields";
import { fillForm } from "./fillForm";
import { inspectForm } from "./inspect";

async function makeFormPdf(): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.addPage([400, 400]);
  const empty = await doc.save();
  return addFields(empty, [
    {
      name: "name",
      type: "text",
      page: 0,
      rect: { x: 40, y: 320, width: 200, height: 24 },
    },
    {
      name: "agree",
      type: "checkbox",
      page: 0,
      rect: { x: 40, y: 280, width: 16, height: 16 },
    },
  ]);
}

describe("fillForm", () => {
  let pdf: Uint8Array;

  beforeAll(async () => {
    pdf = await makeFormPdf();
  });

  it("sets text + checkbox values", async () => {
    const filled = await fillForm(pdf, { name: "Bob", agree: true });
    const fields = await inspectForm(filled);
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
    expect(byName.name?.value).toBe("Bob");
    expect(byName.agree?.value).toBe(true);
  });

  it("flatten removes the interactive form", async () => {
    const filled = await fillForm(
      pdf,
      { name: "Bob", agree: true },
      { flatten: true },
    );
    const fields = await inspectForm(filled);
    expect(fields).toEqual([]);
  });

  it("skips unknown field names without throwing", async () => {
    await expect(
      fillForm(pdf, { nonexistent: "x", name: "Carol" }),
    ).resolves.toBeInstanceOf(Uint8Array);
  });
});
