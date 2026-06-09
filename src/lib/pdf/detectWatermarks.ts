"use client";

import type { PdfBytes } from "./types";

export interface WatermarkCandidate {
  text: string;
  /** Pages where this text appears, 0-indexed. */
  pages: number[];
  /** Approximate bounding box per page (PDF user space). */
  occurrences: Array<{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  /** Fraction of pages where this text appears. 0..1. */
  coverage: number;
}

/**
 * Best-effort watermark text detection. Reads each page's text content
 * and surfaces strings that appear on a high fraction of pages — the
 * usual signature of a watermark like "DRAFT" or "CONFIDENTIAL".
 *
 * This won't find raster watermarks (page is a flattened image). For
 * those, the remove tool's UI surfaces the limitation honestly.
 *
 * Threshold: the same text on ≥ 60% of pages is reported. Single-page
 * PDFs report every distinct string.
 */
export async function detectWatermarks(
  file: PdfBytes,
  opts: { coverageThreshold?: number } = {},
): Promise<WatermarkCandidate[]> {
  const threshold = opts.coverageThreshold ?? 0.6;
  const pdfjs =
    (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).toString();

  const doc = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise;
  const pageCount = doc.numPages;

  type Occ = {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  const byText = new Map<string, { pages: Set<number>; occurrences: Occ[] }>();

  for (let i = 0; i < pageCount; i++) {
    const page = await doc.getPage(i + 1);
    const content = await page.getTextContent();
    for (const item of content.items) {
      const text = (item as { str?: string }).str?.trim() ?? "";
      if (!text || text.length < 3) continue;
      const tx = (item as { transform?: number[] }).transform ?? [
        1, 0, 0, 1, 0, 0,
      ];
      const x = tx[4] ?? 0;
      const y = tx[5] ?? 0;
      const width = (item as { width?: number }).width ?? 0;
      const height = (item as { height?: number }).height ?? 12;
      const slot = byText.get(text) ?? {
        pages: new Set<number>(),
        occurrences: [] as Occ[],
      };
      slot.pages.add(i);
      slot.occurrences.push({ page: i, x, y, width, height });
      byText.set(text, slot);
    }
  }

  const minPages =
    pageCount === 1 ? 1 : Math.max(1, Math.ceil(pageCount * threshold));
  const candidates: WatermarkCandidate[] = [];
  for (const [text, { pages, occurrences }] of byText) {
    if (pages.size < minPages) continue;
    candidates.push({
      text,
      pages: Array.from(pages).sort((a, b) => a - b),
      occurrences,
      coverage: pages.size / pageCount,
    });
  }

  candidates.sort((a, b) => b.coverage - a.coverage);
  return candidates;
}
