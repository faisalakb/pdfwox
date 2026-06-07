import { beforeAll, describe, expect, it } from "vitest";
import { inspectForm } from "./inspect";
import { fillForm } from "./fillForm";

async function makeFormPdf(): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const form = doc.getForm();
  const name = form.createTextField("name");
  name.setText("");
  name.addToPage(page, { x: 40, y: 320, width: 200, height: 24 });
  const subscribe = form.createCheckBox("subscribe");
  subscribe.addToPage(page, { x: 40, y: 280, width: 16, height: 16 });
  const country = form.createDropdown("country");
  country.addOptions(["US", "UK", "CA"]);
  country.select("US");
  country.addToPage(page, { x: 40, y: 240, width: 120, height: 24 });
  return doc.save();
}

describe("inspectForm", () => {
  let formPdf: Uint8Array;

  beforeAll(async () => {
    formPdf = await makeFormPdf();
  });

  it("returns one entry per AcroForm field", async () => {
    const fields = await inspectForm(formPdf);
    expect(fields.length).toBe(3);
    expect(fields.map((f) => f.name).sort()).toEqual([
      "country",
      "name",
      "subscribe",
    ]);
  });

  it("classifies field types", async () => {
    const fields = await inspectForm(formPdf);
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
    expect(byName.name?.type).toBe("text");
    expect(byName.subscribe?.type).toBe("checkbox");
    expect(byName.country?.type).toBe("dropdown");
  });

  it("returns dropdown options", async () => {
    const fields = await inspectForm(formPdf);
    const country = fields.find((f) => f.name === "country");
    expect(country?.options).toEqual(["US", "UK", "CA"]);
  });

  it("survives a fillForm round-trip and reads back values", async () => {
    const filled = await fillForm(formPdf, {
      name: "Alice",
      subscribe: true,
      country: "UK",
    });
    const fields = await inspectForm(filled);
    const byName = Object.fromEntries(fields.map((f) => [f.name, f]));
    expect(byName.name?.value).toBe("Alice");
    expect(byName.subscribe?.value).toBe(true);
    expect(byName.country?.value).toEqual(["UK"]);
  });

  it("returns empty array for a PDF with no form", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    const fields = await inspectForm(await doc.save());
    expect(fields).toEqual([]);
  });
});
