import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("watermark a PDF → upload to remover → pick candidate → cover → download", async ({
  page,
}) => {
  test.setTimeout(90_000);
  // Step 1: produce a watermarked fixture via the add-watermark tool.
  await page.goto("/add-watermark-to-pdf");
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "two-page.pdf"));
  await expect(page.getByLabel("Watermark text")).toBeVisible({
    timeout: 15_000,
  });
  await page.getByLabel("Watermark text").fill("E2E_REMOVE_ME");

  const wmDownload = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Save & download/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const wmFile = await wmDownload;
  const wmPath = path.join(ASSET_DIR, "_pre-remove.pdf");
  await wmFile.saveAs(wmPath);

  // Step 2: feed it to the remove tool.
  await page.goto("/remove-watermark-from-pdf");
  await page.locator('input[type="file"]').setInputFiles(wmPath);

  // The scan completes and the candidate appears.
  await expect(page.getByText(/E2E_REMOVE_ME/)).toBeVisible({
    timeout: 30_000,
  });

  // Click the checkbox for the candidate. The label wraps the checkbox, so
  // clicking the text triggers it via the label association.
  await page.getByText(/E2E_REMOVE_ME/).click();

  const rmDownload = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /^Cover & download/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const rmFile = await rmDownload;
  const rmPath = path.join(ASSET_DIR, "_post-remove.pdf");
  await rmFile.saveAs(rmPath);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(rmPath);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(2);

  await fs.unlink(wmPath);
  await fs.unlink(rmPath);
});
