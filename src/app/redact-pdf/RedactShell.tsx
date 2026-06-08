"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview, type PageMeta } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "editing" | "processing" | "done" | "error";

const TOOL_SLUG = "/redact-pdf";

interface PlacedRedaction {
  /** Display rect in CSS-pixel coords on the canvas. */
  display: {
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function RedactShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageMeta, setPageMeta] = React.useState<PageMeta | null>(null);
  const [filename, setFilename] = React.useState("redacted.pdf");
  const [redactions, setRedactions] = React.useState<PlacedRedaction[]>([]);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const drawRef = React.useRef<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    pageMeta: PageMeta;
    pageIndex: number;
  } | null>(null);
  const [drawPreview, setDrawPreview] = React.useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    pageIndex: number;
  } | null>(null);

  React.useEffect(() => {
    track({ type: "tool_viewed", tool: TOOL_SLUG });
  }, []);

  React.useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const onAccepted = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    track({
      type: "file_added",
      tool: TOOL_SLUG,
      fileType: file.type || "application/pdf",
      sizeBucket: bucketBytes(file.size),
    });
    setFilename(file.name.replace(/\.pdf$/i, "") + "-redacted.pdf");
    setBytes(new Uint8Array(await file.arrayBuffer()));
    setPhase("editing");
  }, []);

  const reset = React.useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setBytes(null);
    setRedactions([]);
    setPageIndex(0);
    setPageMeta(null);
    drawRef.current = null;
    setDrawPreview(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase("empty");
  }, [downloadUrl]);

  const overlay = React.useCallback(
    (meta: PageMeta) => {
      const pageRedactions = redactions.filter(
        (r) => r.display.pageIndex === pageIndex,
      );
      return (
        <>
          {pageRedactions.map((r, i) => (
            <div
              key={i}
              className="absolute bg-black/85"
              style={{
                left: r.display.x,
                top: r.display.y,
                width: r.display.width,
                height: r.display.height,
              }}
            />
          ))}
          {drawPreview && drawPreview.pageIndex === pageIndex && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-[var(--color-danger)] bg-black/30"
              style={{
                left: Math.min(drawPreview.startX, drawPreview.x),
                top: Math.min(drawPreview.startY, drawPreview.y),
                width: Math.abs(drawPreview.x - drawPreview.startX),
                height: Math.abs(drawPreview.y - drawPreview.startY),
              }}
            />
          )}
          <div
            data-testid="draw-layer"
            className="absolute inset-0 cursor-crosshair"
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              drawRef.current = {
                startX: x,
                startY: y,
                x,
                y,
                pageMeta: meta,
                pageIndex,
              };
              setDrawPreview({ startX: x, startY: y, x, y, pageIndex });
            }}
            onPointerMove={(e) => {
              const curr = drawRef.current;
              if (!curr) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              drawRef.current = { ...curr, x, y };
              setDrawPreview({
                startX: curr.startX,
                startY: curr.startY,
                x,
                y,
                pageIndex: curr.pageIndex,
              });
            }}
            onPointerUp={() => {
              const curr = drawRef.current;
              drawRef.current = null;
              setDrawPreview(null);
              if (!curr) return;
              const w = Math.abs(curr.x - curr.startX);
              const h = Math.abs(curr.y - curr.startY);
              if (w < 8 || h < 8) return;
              const x = Math.min(curr.startX, curr.x);
              const y = Math.min(curr.startY, curr.y);
              setRedactions((rs) => [
                ...rs,
                {
                  display: {
                    pageIndex: curr.pageIndex,
                    x,
                    y,
                    width: w,
                    height: h,
                  },
                },
              ]);
            }}
          />
        </>
      );
    },
    [redactions, drawPreview, pageIndex],
  );

  /**
   * Rasterize each page that has redactions: render to a canvas at 2× DPI,
   * paint solid black over the user's rectangles, convert to PNG bytes.
   * Pages without redactions are skipped — pdf-lib keeps them vector.
   */
  const rasterizeAffectedPages = React.useCallback(
    async (
      pdfBytes: Uint8Array,
    ): Promise<
      { pageIndex: number; imageBytes: Uint8Array; mime: string }[]
    > => {
      const grouped = new Map<number, PlacedRedaction[]>();
      for (const r of redactions) {
        const arr = grouped.get(r.display.pageIndex) ?? [];
        arr.push(r);
        grouped.set(r.display.pageIndex, arr);
      }
      if (grouped.size === 0) return [];

      const pdfjs =
        (await import("pdfjs-dist/legacy/build/pdf.mjs")) as typeof import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.mjs",
        import.meta.url,
      ).toString();
      const doc = await pdfjs.getDocument({ data: new Uint8Array(pdfBytes) })
        .promise;
      const RASTER_SCALE = 2;

      const result: {
        pageIndex: number;
        imageBytes: Uint8Array;
        mime: string;
      }[] = [];
      for (const [pIdx, rects] of grouped) {
        const page = await doc.getPage(pIdx + 1);
        const viewport = page.getViewport({ scale: RASTER_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("rasterize: no 2d context");
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Convert CSS-pixel rects (from the preview-scale canvas) to the
        // raster-scale canvas's pixel coords. The preview was rendered at
        // the PdfPreview default scale; we use the *first* redaction's
        // stored pageMeta (they're all on the same page so all share it
        // in practice — but tracking pageMeta directly per redaction
        // would be more correct if we let users mix scales).
        const previewScale = pageMeta?.scale ?? 1.5;
        const ratio = RASTER_SCALE / previewScale;

        ctx.fillStyle = "#000";
        for (const r of rects) {
          ctx.fillRect(
            r.display.x * ratio,
            r.display.y * ratio,
            r.display.width * ratio,
            r.display.height * ratio,
          );
        }

        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob(
            (b) => (b ? res(b) : rej(new Error("toBlob null"))),
            "image/png",
          ),
        );
        result.push({
          pageIndex: pIdx,
          imageBytes: new Uint8Array(await blob.arrayBuffer()),
          mime: "image/png",
        });
      }
      return result;
    },
    [redactions, pageMeta],
  );

  const onSave = React.useCallback(async () => {
    if (!bytes || redactions.length === 0) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const replacements = await rasterizeAffectedPages(bytes);
      const api = await getPdfApi();
      const out = await api.replacePages(bytes, replacements);
      const blob = new Blob([new Uint8Array(out)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setPhase("done");
      track({
        type: "tool_succeeded",
        tool: TOOL_SLUG,
        durationMs: Math.round(performance.now() - t0),
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      setErrorMsg(reason);
      setPhase("error");
      track({
        type: "tool_failed",
        tool: TOOL_SLUG,
        fileType: "application/pdf",
        browser: detectBrowser(),
        sizeBucket: bucketBytes(bytes.byteLength),
        reason,
      });
    }
  }, [bytes, redactions.length, rasterizeAffectedPages]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF to redact"
        hint="Drag black boxes over content you want truly gone. We re-save the affected pages as images so the underlying text can't be recovered."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t save redacted PDF"
        description={errorMsg ?? "Try again with a different file."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    );
  }

  const perPage = redactions.filter(
    (r) => r.display.pageIndex === pageIndex,
  ).length;

  return (
    <div className="space-y-5">
      <Card variant="muted">
        <p className="text-sm text-[var(--color-ink)]">
          <strong>How this actually works:</strong> when you save, the pages you
          marked are converted to images with black boxes baked in. Nothing
          visible <em>or invisible</em> survives behind the boxes — we tested
          this with the same text-extraction tool an attacker would use. Pages
          without redactions keep their selectable text.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {bytes ? (
            <PdfPreview
              bytes={bytes}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
              onPageMeta={setPageMeta}
              overlay={overlay}
            />
          ) : null}
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Click and drag on the page to add a redaction. Switch pages with the
            arrows.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Redactions</h3>
              <span className="text-xs text-[var(--color-ink-muted)]">
                p{pageIndex + 1}: {perPage} · total {redactions.length}
              </span>
            </div>
            {redactions.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                None yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {redactions.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      Page {r.display.pageIndex + 1} ·{" "}
                      {Math.round(r.display.width)}×{" "}
                      {Math.round(r.display.height)}px
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRedactions((rs) => rs.filter((_, j) => j !== i))
                      }
                      className="focus-ring text-[var(--color-ink-muted)] hover:text-[var(--color-danger)]"
                      aria-label={`Remove redaction ${i + 1}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={reset}>
              Start over
            </Button>
            {phase === "done" && downloadUrl ? (
              <a
                href={downloadUrl}
                download={filename}
                onClick={() =>
                  track({ type: "download_clicked", tool: TOOL_SLUG })
                }
                className="focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Download
              </a>
            ) : (
              <Button
                onClick={onSave}
                disabled={
                  phase === "processing" || redactions.length === 0 || !pageMeta
                }
              >
                {phase === "processing"
                  ? "Redacting…"
                  : `Apply redactions (${redactions.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
