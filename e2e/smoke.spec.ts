import { expect, test } from "@playwright/test";

test("homepage renders registry and the live filter accepts input", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Popular tools/i }),
  ).toBeVisible();
  // Live filter is wired; the panel renders only after typing.
  const search = page.getByRole("searchbox", { name: /search/i });
  await search.fill("heic");
  await expect(search).toHaveValue("heic");
  // Clear button surfaces once there's a value.
  await expect(
    page.getByRole("button", { name: /clear search/i }),
  ).toBeVisible();
});

test("demo route shows the drop zone", async ({ page }) => {
  await page.goto("/dev/demo-merge");
  await expect(
    page.getByRole("heading", { name: /Merge PDFs/i }),
  ).toBeVisible();
  await expect(page.getByText(/Drop two or more PDFs/i)).toBeVisible();
});
