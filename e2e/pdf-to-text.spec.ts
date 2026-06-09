import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");

test("upload text PDF → extract → text area shows the sentinel content", async ({
  page,
}) => {
  await page.goto("/pdf-to-text");
  await expect(
    page.getByRole("heading", { name: /Extract text from a PDF/i }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "text.pdf"));

  await expect(
    page.getByRole("heading", { name: /^Extracted text$/ }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("textbox")).toContainText(
    "TestSentinelText12345",
  );
  await expect(
    page.getByRole("link", { name: /Download \.txt/i }),
  ).toBeVisible();
});
