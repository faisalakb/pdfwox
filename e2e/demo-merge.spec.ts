import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload → worker → download produces a valid PDF", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");

  await page.goto("/dev/demo-merge");

  // Set files directly on the hidden file input (react-dropzone exposes
  // the input via getInputProps()).
  const input = page.locator('input[type="file"]');
  await input.setInputFiles([
    path.join(ASSET_DIR, "two-page.pdf"),
    path.join(ASSET_DIR, "three-page.pdf"),
  ]);

  // The "uploaded" card surfaces — click Merge.
  await page.getByRole("button", { name: /^Merge$/ }).click();

  // The download anchor appears at "done" phase.
  await page.getByRole("link", { name: /Download/i }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_downloaded.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  await fs.unlink(tmp);
});
