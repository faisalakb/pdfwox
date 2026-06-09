# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pdf-to-text.spec.ts >> upload text PDF → extract → text area shows the sentinel content
- Location: e2e/pdf-to-text.spec.ts:6:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /^Extracted text$/ })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: /^Extracted text$/ })

```

```yaml
- banner:
  - link "PrivPDF":
    - /url: /
  - navigation "Primary":
    - list:
      - listitem:
        - button "Forms"
      - listitem:
        - button "Convert"
      - listitem:
        - button "Security"
      - listitem:
        - button "Edit"
      - listitem:
        - button "Sign"
      - listitem:
        - button "OCR & Text"
      - listitem:
        - link "Guides":
          - /url: /blog
  - link "Why browser-based":
    - /url: /why-browser-based
- main:
  - navigation "Breadcrumb":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "OCR & Text":
          - /url: https://privpdf.example/#ocr
      - listitem: PDF to Text
  - heading "Extract text from a PDF" [level=1]
  - paragraph: Pull clean plain text out of any PDF in your browser. Text PDFs extract instantly; scanned PDFs go through in-browser OCR.
  - paragraph: Files are processed entirely in your browser. Nothing is uploaded to any server.
  - alert:
    - paragraph: Couldn’t extract text
    - paragraph: No "GlobalWorkerOptions.workerSrc" specified.
    - button "Try again"
  - heading "How it works" [level=2]
  - list:
    - listitem:
      - text: "1"
      - heading "Upload PDF" [level=3]
      - paragraph: Drop or pick the PDF.
    - listitem:
      - text: "2"
      - heading "We extract text" [level=3]
      - paragraph: Text-based PDFs are parsed instantly. Scanned PDFs go through OCR in your browser.
    - listitem:
      - text: "3"
      - heading "Edit & download" [level=3]
      - paragraph: Clean up artifacts if you want, then download a .txt file.
  - heading "Frequently asked questions" [level=2]
  - group: Is my file uploaded?
  - group: How does OCR work in the browser?
  - group: Will it work on a poorly scanned PDF?
  - group: Max file size?
  - group: Will it preserve layout?
  - heading "Related tools" [level=2]
  - heading "OCR PDF" [level=3]:
    - link "OCR PDF":
      - /url: /ocr-pdf
  - paragraph: Make scans searchable & selectable.
  - heading "Fill PDF" [level=3]:
    - link "Fill PDF":
      - /url: /fill-pdf
  - paragraph: Type into PDF form fields and download a filled copy.
  - heading "Sign PDF" [level=3]:
    - link "Sign PDF":
      - /url: /sign-pdf
  - paragraph: Add your signature to any PDF.
  - paragraph: Deeper guide
  - heading "Read the full how-to" [level=3]
  - link "Open the guide":
    - /url: /blog/how-to-scan-documents-to-pdf
- contentinfo:
  - link "PrivPDF":
    - /url: /
  - paragraph: Free PDF tools that run entirely in your browser. No uploads, no signup, no tracking — your files never leave your device.
  - paragraph: Works in your browser · No signup · Files stay private
  - heading "Forms" [level=4]
  - list:
    - listitem:
      - link "Fill PDF":
        - /url: /fill-pdf
    - listitem:
      - link "Create fillable PDF":
        - /url: /create-fillable-pdf
  - heading "Convert" [level=4]
  - list:
    - listitem:
      - link "HEIC to PDF":
        - /url: /heic-to-pdf
    - listitem:
      - link "PNG to PDF":
        - /url: /png-to-pdf
    - listitem:
      - link "JPG to PDF":
        - /url: /jpg-to-pdf
    - listitem:
      - link "WebP to PDF":
        - /url: /webp-to-pdf
    - listitem:
      - link "BMP to PDF":
        - /url: /bmp-to-pdf
    - listitem:
      - link "GIF to PDF":
        - /url: /gif-to-pdf
  - heading "Security" [level=4]
  - list:
    - listitem:
      - link "Unlock PDF":
        - /url: /unlock-pdf
    - listitem:
      - link "Protect PDF":
        - /url: /protect-pdf
  - heading "Edit" [level=4]
  - list:
    - listitem:
      - link "Redact PDF":
        - /url: /redact-pdf
    - listitem:
      - link "Annotate PDF":
        - /url: /annotate-pdf
    - listitem:
      - link "Add watermark to PDF":
        - /url: /add-watermark-to-pdf
    - listitem:
      - link "Remove watermark from PDF":
        - /url: /remove-watermark-from-pdf
  - heading "Sign" [level=4]
  - list:
    - listitem:
      - link "Sign PDF":
        - /url: /sign-pdf
  - heading "OCR & Text" [level=4]
  - list:
    - listitem:
      - link "PDF to Text":
        - /url: /pdf-to-text
    - listitem:
      - link "OCR PDF":
        - /url: /ocr-pdf
  - paragraph: © 2026 PrivPDF. All rights reserved.
  - list:
    - listitem:
      - link "About":
        - /url: /about
    - listitem:
      - link "Privacy":
        - /url: /privacy
    - listitem:
      - link "Why browser-based":
        - /url: /why-browser-based
    - listitem:
      - link "Guides":
        - /url: /blog
- alert
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import path from "node:path";
  3  | 
  4  | const ASSET_DIR = path.resolve(__dirname, "../test-assets");
  5  | 
  6  | test("upload text PDF → extract → text area shows the sentinel content", async ({
  7  |   page,
  8  | }) => {
  9  |   await page.goto("/pdf-to-text");
  10 |   await expect(
  11 |     page.getByRole("heading", { name: /Extract text from a PDF/i }),
  12 |   ).toBeVisible();
  13 | 
  14 |   await page
  15 |     .locator('input[type="file"]')
  16 |     .setInputFiles(path.join(ASSET_DIR, "text.pdf"));
  17 | 
  18 |   await expect(
  19 |     page.getByRole("heading", { name: /^Extracted text$/ }),
> 20 |   ).toBeVisible({ timeout: 20_000 });
     |     ^ Error: expect(locator).toBeVisible() failed
  21 |   await expect(page.getByRole("textbox")).toContainText(
  22 |     "TestSentinelText12345",
  23 |   );
  24 |   await expect(
  25 |     page.getByRole("link", { name: /Download \.txt/i }),
  26 |   ).toBeVisible();
  27 | });
  28 | 
```