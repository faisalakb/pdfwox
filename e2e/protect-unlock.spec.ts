import { expect, test } from "@playwright/test";
import path from "node:path";

const ASSET_DIR = path.resolve(__dirname, "../test-assets");
const PASSWORD = "Sw0rdfish-Test";

test("protect a PDF, then unlock it back to a readable PDF", async ({
  page,
}) => {
  // ─── Protect ─────────────────────────────────────────
  await page.goto("/protect-pdf");
  await expect(
    page.getByRole("heading", { name: /Add a password to a PDF/i }),
  ).toBeVisible();

  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "form.pdf"));

  // Two password fields appear via Card → Input.
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm").fill(PASSWORD);

  const protectDownload = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Protect & download/i }).click();
  // After encryption, button is replaced by an <a download>.
  await page.getByRole("link", { name: /^Download$/ }).click();
  const protectedFile = await protectDownload;
  const protectedPath = path.join(ASSET_DIR, "_encrypted.pdf");
  await protectedFile.saveAs(protectedPath);

  // Sanity check: the protected file has the /Encrypt marker.
  const fs = await import("node:fs/promises");
  const protectedBytes = await fs.readFile(protectedPath);
  expect(protectedBytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  expect(protectedBytes.includes(Buffer.from("/Encrypt"))).toBe(true);

  // ─── Unlock ──────────────────────────────────────────
  await page.goto("/unlock-pdf");
  await expect(
    page.getByRole("heading", { name: /Unlock a PDF/i }),
  ).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles(protectedPath);
  await page.getByLabel("PDF password").fill(PASSWORD);

  const unlockDownload = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Unlock & download/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const unlockedFile = await unlockDownload;
  const unlockedPath = path.join(ASSET_DIR, "_unlocked.pdf");
  await unlockedFile.saveAs(unlockedPath);

  const unlockedBytes = await fs.readFile(unlockedPath);
  expect(unlockedBytes.subarray(0, 4).toString("ascii")).toBe("%PDF");
  // The unlocked file should NOT have /Encrypt anymore.
  expect(unlockedBytes.includes(Buffer.from("/Encrypt"))).toBe(false);

  // pdf-lib should load it without ignoreEncryption.
  const { PDFDocument } = await import("pdf-lib");
  await expect(PDFDocument.load(unlockedBytes)).resolves.toBeDefined();

  await fs.unlink(protectedPath);
  await fs.unlink(unlockedPath);
});

test("unlock with the wrong password shows a friendly error", async ({
  page,
}) => {
  // Build an encrypted file first via the protect tool.
  await page.goto("/protect-pdf");
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(ASSET_DIR, "form.pdf"));
  await page.getByLabel("Password", { exact: true }).fill("right-pw");
  await page.getByLabel("Confirm").fill("right-pw");

  const protectDownload = page.waitForEvent("download", { timeout: 60_000 });
  await page.getByRole("button", { name: /Protect & download/i }).click();
  await page.getByRole("link", { name: /^Download$/ }).click();
  const file = await protectDownload;
  const encPath = path.join(ASSET_DIR, "_enc-wrong.pdf");
  await file.saveAs(encPath);

  // Try to unlock with the wrong password.
  await page.goto("/unlock-pdf");
  await page.locator('input[type="file"]').setInputFiles(encPath);
  await page.getByLabel("PDF password").fill("wrong-pw");
  await page.getByRole("button", { name: /Unlock & download/i }).click();

  await expect(page.getByText(/Couldn.t unlock/i)).toBeVisible({
    timeout: 60_000,
  });

  const fs = await import("node:fs/promises");
  await fs.unlink(encPath);
});
