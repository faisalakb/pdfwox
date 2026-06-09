import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload PDF → type watermark text → save → output contains the text", async ({
  page,
}) => {
  await page.goto("/add-watermark-to-pdf");
  await expect(
    page.getByRole("heading", { name: /Add a watermark to your PDF/i }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "two-page.pdf"));

  // Wait for the editing UI.
  await expect(page.getByLabel("Watermark text")).toBeVisible({
    timeout: 15_000,
  });
  await page.getByLabel("Watermark text").fill("E2E_WATERMARK");

  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Save & download/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_watermarked.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");

  // The watermark text should be extractable on the first page.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
  const content = await (await doc.getPage(1)).getTextContent();
  const joined = content.items
    .map((it: unknown) => (it as { str?: string }).str ?? "")
    .join(" ");
  expect(joined).toContain("E2E_WATERMARK");
  await fs.unlink(tmp);
});
