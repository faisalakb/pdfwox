import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload two JPGs → make PDF → download → output has 2 pages", async ({
  page,
}) => {
  await page.goto("/jpg-to-pdf");
  await expect(
    page.getByRole("heading", { name: /Convert JPG images to PDF/i }),
  ).toBeVisible();

  // Use the same 1x1.jpg fixture twice — Playwright accepts it as
  // two distinct selections by passing both paths.
  await page
    .locator('input[type="file"]')
    .setInputFiles([
      path.join(ASSET_DIR, "1x1.jpg"),
      path.join(ASSET_DIR, "1x1.jpg"),
    ]);

  await expect(
    page.getByRole("heading", { name: /^2 images$/i }),
  ).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Make PDF$/ }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_jpg-out.pdf");
  await download.saveAs(tmp);
  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(2);
  await fs.unlink(tmp);
});
