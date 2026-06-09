"use client";

import type { PdfBytes } from "./types";

/**
 * Pull selectable text out of a PDF. Works on text-based PDFs without OCR.
 * Returns plain text per page (joined by form feeds) plus a heuristic
 * that tells callers whether the input is likely a scan.
 *
 * For scans (image-only PDFs), each page's `text` will be empty/whitespace.
 * That's the signal to escalate to `ocrSandwich`.
 */
export interface ExtractedPdfText {
  pages: { index: number; text: string }[];
  /** True if every page returned no extractable text — likely a scan. */
  likelyScan: boolean;
  fullText: string;
}

export async function extractText(file: PdfBytes): Promise<ExtractedPdfText> {
  const pdfjs =
    (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
  // Set workerSrc only in real browsers. Under Node/jsdom the ESM loader
  // can't fetch the worker URL; pdf.js's fake-worker fallback handles
  // getTextContent fine without one.
  const inNode =
    typeof process !== "undefined" &&
    Boolean(
      (process as unknown as { versions?: { node?: string } }).versions?.node,
    );
  if (!inNode) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
      import.meta.url,
    ).toString();
  }

  const doc = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise;
  const pages: { index: number; text: string }[] = [];
  let totalChars = 0;
  for (let i = 0; i < doc.numPages; i++) {
    const page = await doc.getPage(i + 1);
    const content = await page.getTextContent();
    const text = content.items
      .map((it: unknown) => (it as { str?: string }).str ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push({ index: i, text });
    totalChars += text.length;
  }
  const fullText = pages.map((p) => p.text).join("\n\n");
  return {
    pages,
    likelyScan: totalChars < pages.length * 20,
    fullText,
  };
}
