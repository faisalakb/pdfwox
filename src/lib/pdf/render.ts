import type { PdfBytes } from "./types";

/**
 * pdf.js rendering helpers. Browser-only (uses canvas/document).
 * Not called from the worker; intended for the main thread.
 */

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsCache: PdfjsModule | null = null;

async function getPdfjs(): Promise<PdfjsModule> {
  if (pdfjsCache) return pdfjsCache;
  const pdfjs =
    (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as PdfjsModule;
  // pdf.js needs a worker URL. Use the bundled legacy worker.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();
  pdfjsCache = pdfjs;
  return pdfjs;
}

export async function renderPageToCanvas(
  file: PdfBytes,
  pageIndex: number,
  scale = 1.5,
  canvas: HTMLCanvasElement = document.createElement("canvas"),
): Promise<HTMLCanvasElement> {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: file }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("renderPageToCanvas: no 2d context");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function pageToBlob(
  file: PdfBytes,
  pageIndex: number,
  format: "png" | "jpeg" = "png",
  quality = 0.92,
): Promise<Blob> {
  const canvas = await renderPageToCanvas(file, pageIndex);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob: null"))),
      `image/${format}`,
      quality,
    );
  });
}

export async function getThumbnails(
  file: PdfBytes,
  opts: { max?: number; scale?: number } = {},
): Promise<HTMLCanvasElement[]> {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: file }).promise;
  const max = Math.min(opts.max ?? doc.numPages, doc.numPages);
  const scale = opts.scale ?? 0.3;
  const out: HTMLCanvasElement[] = [];
  for (let i = 0; i < max; i++) {
    const c = document.createElement("canvas");
    const page = await doc.getPage(i + 1);
    const viewport = page.getViewport({ scale });
    c.width = viewport.width;
    c.height = viewport.height;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("getThumbnails: no 2d context");
    await page.render({ canvasContext: ctx, viewport }).promise;
    out.push(c);
  }
  return out;
}
