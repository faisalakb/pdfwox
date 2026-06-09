"use client";

import type { PdfBytes } from "./types";

export interface OcrProgress {
  /** Current page being processed, 0-indexed. */
  pageIndex: number;
  /** Total pages. */
  total: number;
  /** Stage label ("rendering" | "ocr" | "writing"). */
  stage: string;
  /** Fraction 0..1 across the whole job. */
  fraction: number;
}

/**
 * Run OCR on every page of a PDF and produce a "sandwich" output: the
 * original page image stays visible, with an invisible (opacity 0) text
 * layer baked into the same coordinates underneath. Readers can select,
 * copy, and search the text — and the visible page is unchanged.
 *
 * Architecture:
 *   1. Render each page to a high-DPI canvas via pdf.js (main thread).
 *   2. Hand the canvas to Tesseract.js. It produces words with bounding
 *      boxes in canvas pixels.
 *   3. Build a new PDF via pdf-lib at the original page dimensions;
 *      embed the rendered image as the page; for each Tesseract word,
 *      drawText with opacity 0 at the converted PDF-user-space coords.
 *
 * Why main thread: Tesseract.js manages its own Web Worker internally;
 * trying to nest it under our Comlink worker double-wraps the messaging
 * and is fragile. Main-thread is honest about the workload.
 */
export async function ocrSandwich(
  file: PdfBytes,
  opts: {
    lang?: string; // Default "eng"
    /** Render scale; 2 ≈ 200 DPI, good balance. */
    scale?: number;
    onProgress?: (p: OcrProgress) => void;
  } = {},
): Promise<PdfBytes> {
  const lang = opts.lang ?? "eng";
  const scale = opts.scale ?? 2;

  const pdfjs =
    (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();

  const tesseract = await import("tesseract.js");

  const src = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise;
  const numPages = src.numPages;

  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < numPages; i++) {
    opts.onProgress?.({
      pageIndex: i,
      total: numPages,
      stage: "rendering",
      fraction: i / numPages,
    });

    const srcPage = await src.getPage(i + 1);
    const viewport = srcPage.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ocrSandwich: no 2d context");
    await srcPage.render({ canvasContext: ctx, viewport }).promise;

    opts.onProgress?.({
      pageIndex: i,
      total: numPages,
      stage: "ocr",
      fraction: (i + 0.4) / numPages,
    });

    // Tesseract takes a canvas directly.
    const result = await tesseract.recognize(canvas, lang);
    const { words } = result.data;

    opts.onProgress?.({
      pageIndex: i,
      total: numPages,
      stage: "writing",
      fraction: (i + 0.8) / numPages,
    });

    const pageWidth = srcPage.view[2]! - srcPage.view[0]!;
    const pageHeight = srcPage.view[3]! - srcPage.view[1]!;
    const page = out.addPage([pageWidth, pageHeight]);

    // Embed the rendered raster as the page background — keeps the
    // visible content identical to the input even when Tesseract's OCR
    // is imperfect.
    const png = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("toBlob null"))),
        "image/png",
      ),
    );
    const pngBytes = new Uint8Array(await png.arrayBuffer());
    const image = await out.embedPng(pngBytes);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    // Convert canvas pixel coords → PDF user space; PDF origin is
    // bottom-left, canvas is top-left.
    const sx = pageWidth / canvas.width;
    const sy = pageHeight / canvas.height;

    for (const word of words) {
      const text = word.text?.trim();
      if (!text) continue;
      const bbox = word.bbox;
      if (!bbox) continue;
      const x = bbox.x0 * sx;
      const wPdf = (bbox.x1 - bbox.x0) * sx;
      const hPdf = (bbox.y1 - bbox.y0) * sy;
      // Position text baseline at bottom of bbox.
      const y = pageHeight - bbox.y1 * sy;
      // Size the font so that the word's width approximates the bbox
      // width. Use the bbox height as an upper bound.
      const size = Math.max(
        1,
        Math.min(hPdf, wPdf / Math.max(text.length * 0.5, 1)),
      );
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
        opacity: 0,
      });
    }
  }

  opts.onProgress?.({
    pageIndex: numPages,
    total: numPages,
    stage: "writing",
    fraction: 1,
  });

  return out.save();
}
