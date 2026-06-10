import { expect, test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs/promises";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");
const TMP_OUT = path.join(ASSET_DIR, "_image-to-pdf-out.pdf");

test.afterEach(async () => {
  await fs.unlink(TMP_OUT).catch(() => {});
});

test("happy path: upload image → convert → download → valid PDF", async ({
  page,
}) => {
  await page.goto("/jpg-to-pdf");

  // Dropzone should be visible on load
  const dropzone = page.locator('[data-testid="tool-dropzone"]');
  await expect(dropzone).toBeVisible();

  // Upload via the hidden file input
  await page
    .locator('[data-testid="file-upload"]')
    .setInputFiles(path.join(ASSET_DIR, "sample-image.jpg"));

  // After upload: result panel with convert button visible
  const resultPanel = page.locator('[data-testid="result-panel"]');
  await expect(resultPanel).toBeVisible();

  const convertBtn = page.locator('[data-testid="convert-button"]');
  await expect(convertBtn).toBeVisible();

  // Click convert and wait for the download button to appear
  await convertBtn.click();
  const downloadBtn = page.locator('[data-testid="download-button"]');
  await expect(downloadBtn).toBeVisible({ timeout: 30_000 });

  // Download the file and verify it is a valid PDF
  const downloadPromise = page.waitForEvent("download");
  await downloadBtn.click();
  const download = await downloadPromise;

  await download.saveAs(TMP_OUT);
  const bytes = await fs.readFile(TMP_OUT);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  expect(bytes.byteLength).toBeGreaterThan(1000);
});

test("no-file state: dropzone shown, convert button absent", async ({
  page,
}) => {
  await page.goto("/jpg-to-pdf");

  // Dropzone must be present before any file is added
  await expect(page.locator('[data-testid="tool-dropzone"]')).toBeVisible();

  // Convert button must NOT be present — it only appears after a file is uploaded
  await expect(page.locator('[data-testid="convert-button"]')).not.toBeVisible();

  // No error panel should be shown either
  await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
});

test("mobile viewport: dropzone and upload controls visible", async ({
  page,
  browserName,
}) => {
  // Set a typical iPhone viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jpg-to-pdf");

  const dropzone = page.locator('[data-testid="tool-dropzone"]');
  await expect(dropzone).toBeVisible();

  // Upload and verify convert button is accessible on mobile
  await page
    .locator('[data-testid="file-upload"]')
    .setInputFiles(path.join(ASSET_DIR, "sample-image.jpg"));

  await expect(page.locator('[data-testid="convert-button"]')).toBeVisible();
});
