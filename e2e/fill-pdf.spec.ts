import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload form PDF → fill → download produces a PDF with the new value", async ({
  page,
}) => {
  await page.goto("/fill-pdf");
  await expect(
    page.getByRole("heading", { name: /Fill out PDF forms/i }),
  ).toBeVisible();

  const input = page.locator('input[type="file"]');
  await input.setInputFiles(path.join(ASSET_DIR, "form.pdf"));

  // Sidebar form appears with detected fields
  await expect(page.getByLabel("name", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await page.getByLabel("name", { exact: true }).fill("Alice Example");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Fill & download/i }).click();
  // The button rerenders as an <a> after success — click it.
  await page.getByRole("link", { name: /Download/i }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_filled.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  // Reload via pdf-lib in-process to confirm the field was set.
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();
  expect(form.getTextField("name").getText()).toBe("Alice Example");
  await fs.unlink(tmp);
});
