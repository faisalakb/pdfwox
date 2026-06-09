"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

export interface PageMeta {
  /** Canvas width in CSS pixels (post-scale). */
  width: number;
  /** Canvas height in CSS pixels. */
  height: number;
  /** PDF page width in points (1/72"). */
  pdfWidth: number;
  /** PDF page height in points. */
  pdfHeight: number;
  /** Display scale used to render the canvas. */
  scale: number;
}

export interface PdfPreviewProps {
  bytes: Uint8Array | null;
  pageIndex: number;
  onPageChange?: (pageIndex: number) => void;
  scale?: number;
  /** Notified after each render with the canvas dimensions and the PDF
   *  page dimensions. Useful for placing absolutely-positioned overlays. */
  onPageMeta?: (meta: PageMeta) => void;
  /** Optional overlay rendered on top of the canvas — for field rectangles. */
  overlay?: (meta: PageMeta) => React.ReactNode;
  className?: string;
}

/**
 * Shared pdf.js page renderer. Loads the legacy pdf.js build dynamically
 * so the page chunk only pays for it on interaction.
 */
export function PdfPreview({
  bytes,
  pageIndex,
  onPageChange,
  scale = 1.5,
  onPageMeta,
  overlay,
  className,
}: PdfPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [meta, setMeta] = React.useState<PageMeta | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!bytes) return;
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const pdfjs =
          (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.mjs",
          import.meta.url,
        ).toString();

        // pdf.js consumes a fresh buffer on each load; clone to avoid
        // transferred-ArrayBuffer errors after worker calls.
        const doc = await pdfjs.getDocument({
          data: new Uint8Array(bytes),
        }).promise;
        if (cancelled) return;
        setPageCount(doc.numPages);

        const safeIndex = Math.min(pageIndex, doc.numPages - 1);
        const page = await doc.getPage(safeIndex + 1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) return;

        const pageMeta: PageMeta = {
          width: viewport.width,
          height: viewport.height,
          pdfWidth: page.view[2]! - page.view[0]!,
          pdfHeight: page.view[3]! - page.view[1]!,
          scale,
        };
        setMeta(pageMeta);
        onPageMeta?.(pageMeta);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bytes, pageIndex, scale, onPageMeta]);

  if (error) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] p-4 text-sm text-[var(--color-danger)]">
        Couldn’t render this PDF: {error}
      </div>
    );
  }

  return (
    <div className={className}>
      {pageCount > 1 && (
        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--color-ink-muted)]">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pageIndex === 0}
              onClick={() => onPageChange?.(pageIndex - 1)}
            >
              ← Prev
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pageIndex >= pageCount - 1}
              onClick={() => onPageChange?.(pageIndex + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
      <div className="relative inline-block overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
        {/* Skeleton reserves space while the canvas renders, preventing CLS. */}
        {bytes && !meta && (
          <div
            className="w-full animate-pulse bg-[var(--color-surface-muted)]"
            style={{ aspectRatio: "1 / 1.414", minWidth: 280 }}
          />
        )}
        <canvas
          ref={canvasRef}
          className="block max-w-full"
          style={{ display: meta ? "block" : "none" }}
        />
        {overlay && meta && (
          <div
            className="pointer-events-auto absolute inset-0"
            style={{ width: meta.width, height: meta.height }}
          >
            {overlay(meta)}
          </div>
        )}
      </div>
    </div>
  );
}
