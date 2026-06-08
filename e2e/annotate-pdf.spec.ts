import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload PDF → highlight → save → output PDF still readable", async ({
  page,
}) => {
  await page.goto("/annotate-pdf");
  await expect(
    page.getByRole("heading", { name: /Annotate a PDF/i }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "two-page.pdf"));

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 15_000 });
  const drawLayer = page.getByTestId("draw-layer");
  await expect(drawLayer).toBeVisible({ timeout: 15_000 });

  // Default tool is highlight. Drag a rectangle.
  const box = await drawLayer.boundingBox();
  if (!box) throw new Error("draw layer has no bounding box");
  await page.mouse.move(box.x + 50, box.y + 50);
  await page.mouse.down();
  for (let step = 1; step <= 6; step++) {
    await page.mouse.move(
      box.x + 50 + step * (180 / 6),
      box.y + 50 + step * (30 / 6),
    );
  }
  await page.mouse.up();

  // The annotation appears in the side list.
  await expect(page.getByText(/highlight · p1/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Save annotations/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const download = await downloadPromise;

  const tmp = path.join(ASSET_DIR, "_annotated.pdf");
  await download.saveAs(tmp);

  const fs = await import("node:fs/promises");
  const bytes = await fs.readFile(tmp);
  expect(bytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  expect(doc.getPageCount()).toBe(2);
  await fs.unlink(tmp);
});
