import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload PDF → draw redaction → save → output bytes still %PDF and page count preserved", async ({
  page,
}) => {
  await page.goto("/redact-pdf");
  await expect(
    page.getByRole("heading", {
      name: /Permanently redact text and images in a PDF/i,
    }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "two-page.pdf"));

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  const drawLayer = page.getByTestId("draw-layer");
  await expect(drawLayer).toBeVisible({ timeout: 15_000 });

  const box = await drawLayer.boundingBox();
  if (!box) throw new Error("draw layer has no bounding box");

  // Drag a redaction rectangle.
  await page.mouse.move(box.x + 60, box.y + 60);
  await page.mouse.down();
  for (let step = 1; step <= 8; step++) {
    await page.mouse.move(
      box.x + 60 + step * (200 / 8),
      box.y + 60 + step * (40 / 8),
    );
  }
  await page.mouse.up();

  // Side panel shows it.
  await expect(page.getByText(/p1: 1/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Apply redactions/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_redacted.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(2);
  await fs.unlink(tmp);
});
