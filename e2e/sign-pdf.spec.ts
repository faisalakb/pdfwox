import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("type-mode signature → place → save → output stays a valid 2-page PDF", async ({
  page,
}) => {
  await page.goto("/sign-pdf");
  await expect(
    page.getByRole("heading", { name: /Sign a PDF/i }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "two-page.pdf"));

  // Create-signature card appears.
  await expect(
    page.getByRole("heading", { name: /Create a signature/i }),
  ).toBeVisible({ timeout: 15_000 });

  // Switch to Type tab.
  await page.getByRole("tab", { name: /^Type$/ }).click();
  await page.getByLabel("Type your name").fill("Test Signer");
  await page.getByRole("button", { name: /^Save signature$/ }).click();

  // Place layer appears.
  const placeLayer = page.getByTestId("place-layer");
  await expect(placeLayer).toBeVisible({ timeout: 15_000 });
  const box = await placeLayer.boundingBox();
  if (!box) throw new Error("place layer has no bounding box");

  // Click to drop a signature.
  await page.mouse.click(box.x + 200, box.y + 200);
  await expect(page.getByText(/^Page 1$/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /^Sign & download/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_signed.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(2);
  await fs.unlink(tmp);
});
