"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview, type PageMeta } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/States";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import type { NewFieldSpec, NewFieldType } from "@/lib/pdf/addFields";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "editing" | "processing" | "done" | "error";

const TOOL_SLUG = "/create-fillable-pdf";

interface PendingDraw {
  /** CSS-pixel coords on the canvas. */
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  pageMeta: PageMeta;
}

interface PlacedField extends NewFieldSpec {
  /** Echo of the CSS-pixel rect for redrawing the overlay. */
  display: {
    pageIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

function nextName(existing: PlacedField[], type: NewFieldType): string {
  const sameType = existing.filter((f) => f.type === type).length;
  const prefix =
    type === "text" ? "text" : type === "checkbox" ? "check" : "sig";
  return `${prefix}_${sameType + 1}`;
}

function cssRectToPdfRect(
  rect: { x: number; y: number; width: number; height: number },
  meta: PageMeta,
): NewFieldSpec["rect"] {
  // pdf.js canvas is top-left origin; pdf-lib is bottom-left.
  const sx = meta.pdfWidth / meta.width;
  const sy = meta.pdfHeight / meta.height;
  return {
    x: rect.x * sx,
    y: meta.pdfHeight - (rect.y + rect.height) * sy,
    width: rect.width * sx,
    height: rect.height * sy,
  };
}

export function CreateShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageMeta, setPageMeta] = React.useState<PageMeta | null>(null);
  const [filename, setFilename] = React.useState("fillable.pdf");
  const [fields, setFields] = React.useState<PlacedField[]>([]);
  // Drag state lives in a ref so back-to-back pointer events see the latest
  // value without waiting for React to commit. We mirror just enough into
  // React state to drive the dotted-rectangle preview.
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
  const [pending, setPending] = React.useState<PendingDraw | null>(null);
  const [pendingType, setPendingType] = React.useState<NewFieldType>("text");
  const [pendingName, setPendingName] = React.useState("");
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

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
    setFilename(file.name.replace(/\.pdf$/i, "") + "-fillable.pdf");
    setBytes(new Uint8Array(await file.arrayBuffer()));
    setPhase("editing");
  }, []);

  const reset = React.useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setBytes(null);
    setFields([]);
    setPageIndex(0);
    setPageMeta(null);
    drawRef.current = null;
    setDrawPreview(null);
    setPending(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase("empty");
  }, [downloadUrl]);

  const overlay = React.useCallback(
    (meta: PageMeta) => {
      const pageFields = fields.filter(
        (f) => f.display.pageIndex === pageIndex,
      );
      return (
        <>
          {pageFields.map((f, i) => (
            <div
              key={i}
              className="absolute rounded-sm border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/15"
              style={{
                left: f.display.x,
                top: f.display.y,
                width: f.display.width,
                height: f.display.height,
              }}
            >
              <span className="absolute -top-5 left-0 rounded bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent-ink)]">
                {f.name}
              </span>
            </div>
          ))}
          {drawPreview && drawPreview.pageIndex === pageIndex && (
            <div
              className="pointer-events-none absolute rounded-sm border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent)]/10"
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
              setPending({
                x,
                y,
                width: w,
                height: h,
                pageIndex: curr.pageIndex,
                pageMeta: curr.pageMeta,
              });
              setPendingName(nextName(fields, pendingType));
            }}
          />
        </>
      );
    },
    [fields, drawPreview, pageIndex, pendingType],
  );

  const placeField = React.useCallback(() => {
    if (!pending) return;
    const rect = cssRectToPdfRect(
      {
        x: pending.x,
        y: pending.y,
        width: pending.width,
        height: pending.height,
      },
      pending.pageMeta,
    );
    setFields((curr) => [
      ...curr,
      {
        name: pendingName.trim() || nextName(curr, pendingType),
        type: pendingType,
        page: pending.pageIndex,
        rect,
        display: {
          pageIndex: pending.pageIndex,
          x: pending.x,
          y: pending.y,
          width: pending.width,
          height: pending.height,
        },
      },
    ]);
    setPending(null);
    setPendingName("");
  }, [pending, pendingName, pendingType]);

  const onSave = React.useCallback(async () => {
    if (!bytes || fields.length === 0) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const api = await getPdfApi();
      const specs: NewFieldSpec[] = fields.map(
        ({ display: _display, ...spec }) => spec,
      );
      const out = await api.addFields(bytes, specs);
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
  }, [bytes, fields]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF to make fillable"
        hint="We'll show each page so you can drag rectangles where the fields should go."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t save your fillable PDF"
        description={errorMsg ?? "Try again with a different file."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
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
            Drag a rectangle on the page to add a field. Switch pages with the
            arrows above the preview.
          </p>
        </div>

        <div className="space-y-4">
          {pending ? (
            <Card>
              <h3 className="font-display text-lg">New field</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="new-type">Type</Label>
                  <Select
                    id="new-type"
                    value={pendingType}
                    onChange={(e) => {
                      const t = e.target.value as NewFieldType;
                      setPendingType(t);
                      setPendingName((curr) =>
                        curr === nextName(fields, pendingType)
                          ? nextName(fields, t)
                          : curr,
                      );
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="signature">Signature</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-name">Name</Label>
                  <Input
                    id="new-name"
                    value={pendingName}
                    onChange={(e) => setPendingName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setPending(null)}>
                    Cancel
                  </Button>
                  <Button onClick={placeField}>Add field</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="muted">
              <p className="text-sm text-[var(--color-ink-muted)]">
                Click + drag on the page to draw a field. The type picker
                appears here.
              </p>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Placed fields</h3>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {fields.length}
              </span>
            </div>
            {fields.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                None yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm">
                {fields.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      <span className="font-medium">{f.name}</span>{" "}
                      <span className="text-[var(--color-ink-muted)]">
                        · {f.type} · p{f.page + 1}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFields((curr) => curr.filter((_, j) => j !== i))
                      }
                      className="focus-ring text-[var(--color-ink-muted)] hover:text-[var(--color-danger)]"
                      aria-label={`Remove ${f.name}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div>
            <Label htmlFor="create-filename">Filename</Label>
            <Input
              id="create-filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={phase === "processing"}
            />
          </div>

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
                  phase === "processing" || fields.length === 0 || !pageMeta
                }
              >
                {phase === "processing"
                  ? "Working…"
                  : `Save fillable PDF (${fields.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
