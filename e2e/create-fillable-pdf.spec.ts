import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload PDF → draw a text field → save → output has 1 AcroForm field", async ({
  page,
}) => {
  await page.goto("/create-fillable-pdf");
  await expect(
    page.getByRole("heading", { name: /Create a fillable PDF/i }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "two-page.pdf"));

  // Wait for the pdf.js canvas to mount, finish rendering, and the
  // overlay/drag layer to mount on top of it.
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  const drawLayer = page.getByTestId("draw-layer");
  await expect(drawLayer).toBeVisible({ timeout: 15_000 });

  // Drag a rectangle anchored on the draw layer's bounding box.
  const box = await drawLayer.boundingBox();
  if (!box) throw new Error("draw layer has no bounding box");
  await page.mouse.move(box.x + 60, box.y + 60);
  await page.mouse.down();
  for (let step = 1; step <= 8; step++) {
    await page.mouse.move(
      box.x + 60 + step * (160 / 8),
      box.y + 60 + step * (50 / 8),
    );
  }
  await page.mouse.up();

  // The "New field" panel appears — accept defaults and add.
  await expect(page.getByRole("heading", { name: /New field/i })).toBeVisible();
  await page.getByRole("button", { name: /^Add field$/ }).click();

  // Placed-fields list shows the new entry.
  await expect(page.getByText(/text_1/).first()).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Save fillable PDF/ }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_fillable.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getForm().getFields().length).toBe(1);
  await fs.unlink(tmp);
});
