"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview, type PageMeta } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import type { AnnotationSpec } from "@/lib/pdf/drawAnnotations";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "editing" | "processing" | "done" | "error";
type Tool = "highlight" | "text" | "rect" | "ellipse" | "pen";

const TOOL_SLUG = "/annotate-pdf";

interface PageDisplay {
  page: number;
  scale: number;
  pdfHeight: number;
  pdfWidth: number;
  cssWidth: number;
  cssHeight: number;
}

interface DisplayedAnnotation {
  id: string;
  pageDisplay: PageDisplay;
  spec: AnnotationSpec;
  /** Echo of where the user drew it (CSS-pixel coords for the overlay). */
  displayRect?: { x: number; y: number; width: number; height: number };
  displayPath?: { x: number; y: number }[];
  displayPoint?: { x: number; y: number };
}

const COLORS: { name: string; hex: string }[] = [
  { name: "Yellow", hex: "#fff176" },
  { name: "Red", hex: "#b3261e" },
  { name: "Green", hex: "#1d6b54" },
  { name: "Blue", hex: "#1e40af" },
  { name: "Black", hex: "#1a1a1f" },
];

function cssRectToPdfRect(
  rect: { x: number; y: number; width: number; height: number },
  meta: PageDisplay,
) {
  const sx = meta.pdfWidth / meta.cssWidth;
  const sy = meta.pdfHeight / meta.cssHeight;
  return {
    x: rect.x * sx,
    y: meta.pdfHeight - (rect.y + rect.height) * sy,
    width: rect.width * sx,
    height: rect.height * sy,
  };
}

function cssPointToPdfPoint(pt: { x: number; y: number }, meta: PageDisplay) {
  const sx = meta.pdfWidth / meta.cssWidth;
  const sy = meta.pdfHeight / meta.cssHeight;
  return { x: pt.x * sx, y: meta.pdfHeight - pt.y * sy };
}

export function AnnotateShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [, setPageMeta] = React.useState<PageMeta | null>(null);
  const [filename, setFilename] = React.useState("annotated.pdf");
  const [tool, setTool] = React.useState<Tool>("highlight");
  const [color, setColor] = React.useState(COLORS[0]!.hex);
  const [textPending, setTextPending] = React.useState<{
    x: number;
    y: number;
    display: PageDisplay;
  } | null>(null);
  const [textValue, setTextValue] = React.useState("");
  const [items, setItems] = React.useState<DisplayedAnnotation[]>([]);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const drawRef = React.useRef<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    points: { x: number; y: number }[];
    display: PageDisplay;
  } | null>(null);
  const [preview, setPreview] = React.useState<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    points: { x: number; y: number }[];
    page: number;
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
    setFilename(file.name.replace(/\.pdf$/i, "") + "-annotated.pdf");
    setBytes(new Uint8Array(await file.arrayBuffer()));
    setPhase("editing");
  }, []);

  const reset = React.useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setBytes(null);
    setItems([]);
    setPageIndex(0);
    setPageMeta(null);
    setTextPending(null);
    setTextValue("");
    drawRef.current = null;
    setPreview(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase("empty");
  }, [downloadUrl]);

  const commitPath = (
    points: { x: number; y: number }[],
    display: PageDisplay,
  ) => {
    if (points.length < 2) return;
    const pdfPoints = points.map((p) => cssPointToPdfPoint(p, display));
    setItems((curr) => [
      ...curr,
      {
        id: `${Date.now()}-${Math.random()}`,
        pageDisplay: display,
        displayPath: points,
        spec: {
          kind: "path",
          page: display.page,
          points: pdfPoints,
          color,
          strokeWidth: 2,
        },
      },
    ]);
  };

  const commitRect = (
    rect: { x: number; y: number; width: number; height: number },
    display: PageDisplay,
    kind: "highlight" | "rect" | "ellipse",
  ) => {
    if (rect.width < 8 || rect.height < 8) return;
    const pdfRect = cssRectToPdfRect(rect, display);
    setItems((curr) => [
      ...curr,
      {
        id: `${Date.now()}-${Math.random()}`,
        pageDisplay: display,
        displayRect: rect,
        spec:
          kind === "highlight"
            ? {
                kind: "highlight",
                page: display.page,
                rect: pdfRect,
                color,
                opacity: 0.4,
              }
            : kind === "rect"
              ? {
                  kind: "rect",
                  page: display.page,
                  rect: pdfRect,
                  color,
                  strokeWidth: 1.5,
                }
              : {
                  kind: "ellipse",
                  page: display.page,
                  rect: pdfRect,
                  color,
                  strokeWidth: 1.5,
                },
      },
    ]);
  };

  const commitText = (text: string) => {
    if (!textPending || !text.trim()) {
      setTextPending(null);
      setTextValue("");
      return;
    }
    const pt = cssPointToPdfPoint(
      { x: textPending.x, y: textPending.y + 14 },
      textPending.display,
    );
    setItems((curr) => [
      ...curr,
      {
        id: `${Date.now()}-${Math.random()}`,
        pageDisplay: textPending.display,
        displayPoint: { x: textPending.x, y: textPending.y },
        spec: {
          kind: "text",
          page: textPending.display.page,
          x: pt.x,
          y: pt.y,
          text,
          size: 14,
          color,
        },
      },
    ]);
    setTextPending(null);
    setTextValue("");
  };

  const overlay = React.useCallback(
    (meta: PageMeta) => {
      const display: PageDisplay = {
        page: pageIndex,
        scale: meta.scale,
        pdfHeight: meta.pdfHeight,
        pdfWidth: meta.pdfWidth,
        cssWidth: meta.width,
        cssHeight: meta.height,
      };
      const pageItems = items.filter((it) => it.spec.page === pageIndex);
      return (
        <>
          {/* Previously placed annotations */}
          {pageItems.map((it) => {
            if (it.displayRect && it.spec.kind === "highlight") {
              return (
                <div
                  key={it.id}
                  className="pointer-events-none absolute"
                  style={{
                    left: it.displayRect.x,
                    top: it.displayRect.y,
                    width: it.displayRect.width,
                    height: it.displayRect.height,
                    background: (it.spec.color ?? "#fff176") + "66",
                  }}
                />
              );
            }
            if (it.displayRect && it.spec.kind === "rect") {
              return (
                <div
                  key={it.id}
                  className="pointer-events-none absolute"
                  style={{
                    left: it.displayRect.x,
                    top: it.displayRect.y,
                    width: it.displayRect.width,
                    height: it.displayRect.height,
                    border: `2px solid ${it.spec.color ?? "#000"}`,
                  }}
                />
              );
            }
            if (it.displayRect && it.spec.kind === "ellipse") {
              return (
                <div
                  key={it.id}
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    left: it.displayRect.x,
                    top: it.displayRect.y,
                    width: it.displayRect.width,
                    height: it.displayRect.height,
                    border: `2px solid ${it.spec.color ?? "#000"}`,
                  }}
                />
              );
            }
            if (it.displayPoint && it.spec.kind === "text") {
              return (
                <div
                  key={it.id}
                  className="pointer-events-none absolute whitespace-nowrap"
                  style={{
                    left: it.displayPoint.x,
                    top: it.displayPoint.y,
                    color: it.spec.color ?? "#000",
                    fontSize: 14,
                  }}
                >
                  {it.spec.text}
                </div>
              );
            }
            if (it.displayPath && it.spec.kind === "path") {
              const minX = Math.min(...it.displayPath.map((p) => p.x));
              const minY = Math.min(...it.displayPath.map((p) => p.y));
              const maxX = Math.max(...it.displayPath.map((p) => p.x));
              const maxY = Math.max(...it.displayPath.map((p) => p.y));
              const w = maxX - minX + 4;
              const h = maxY - minY + 4;
              const d = it.displayPath
                .map((p, i) =>
                  i === 0
                    ? `M ${p.x - minX + 2} ${p.y - minY + 2}`
                    : `L ${p.x - minX + 2} ${p.y - minY + 2}`,
                )
                .join(" ");
              return (
                <svg
                  key={it.id}
                  className="pointer-events-none absolute"
                  style={{ left: minX - 2, top: minY - 2, width: w, height: h }}
                  viewBox={`0 0 ${w} ${h}`}
                >
                  <path
                    d={d}
                    stroke={it.spec.color ?? "#000"}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              );
            }
            return null;
          })}

          {/* In-progress preview */}
          {preview &&
            preview.page === pageIndex &&
            tool !== "text" &&
            (tool === "pen" ? (
              <svg
                className="pointer-events-none absolute inset-0"
                style={{ width: meta.width, height: meta.height }}
              >
                <path
                  d={preview.points
                    .map((p, i) =>
                      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`,
                    )
                    .join(" ")}
                  stroke={color}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <div
                className="pointer-events-none absolute"
                style={{
                  left: Math.min(preview.startX, preview.x),
                  top: Math.min(preview.startY, preview.y),
                  width: Math.abs(preview.x - preview.startX),
                  height: Math.abs(preview.y - preview.startY),
                  background:
                    tool === "highlight" ? color + "55" : "transparent",
                  border: tool === "highlight" ? "none" : `2px dashed ${color}`,
                  borderRadius: tool === "ellipse" ? "100%" : 0,
                }}
              />
            ))}

          {/* Input layer */}
          <div
            data-testid="draw-layer"
            className={cn(
              "absolute inset-0",
              tool === "text" ? "cursor-text" : "cursor-crosshair",
            )}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              if (tool === "text") {
                setTextPending({ x, y, display });
                setTextValue("");
                return;
              }
              drawRef.current = {
                startX: x,
                startY: y,
                x,
                y,
                points: [{ x, y }],
                display,
              };
              setPreview({
                startX: x,
                startY: y,
                x,
                y,
                points: [{ x, y }],
                page: pageIndex,
              });
            }}
            onPointerMove={(e) => {
              const curr = drawRef.current;
              if (!curr) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              if (tool === "pen") {
                curr.points.push({ x, y });
              }
              drawRef.current = { ...curr, x, y };
              setPreview({
                startX: curr.startX,
                startY: curr.startY,
                x,
                y,
                points: curr.points.slice(),
                page: curr.display.page,
              });
            }}
            onPointerUp={() => {
              const curr = drawRef.current;
              drawRef.current = null;
              setPreview(null);
              if (!curr) return;
              if (tool === "pen") {
                commitPath(curr.points, curr.display);
              } else if (
                tool === "highlight" ||
                tool === "rect" ||
                tool === "ellipse"
              ) {
                const w = Math.abs(curr.x - curr.startX);
                const h = Math.abs(curr.y - curr.startY);
                commitRect(
                  {
                    x: Math.min(curr.startX, curr.x),
                    y: Math.min(curr.startY, curr.y),
                    width: w,
                    height: h,
                  },
                  curr.display,
                  tool,
                );
              }
            }}
          />

          {/* Text-input popup */}
          {textPending && textPending.display.page === pageIndex && (
            <div
              className="absolute z-10 rounded-[var(--radius-sm)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-md)]"
              style={{
                left: textPending.x,
                top: textPending.y + 18,
                pointerEvents: "auto",
              }}
            >
              <input
                autoFocus
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitText(textValue);
                  if (e.key === "Escape") {
                    setTextPending(null);
                    setTextValue("");
                  }
                }}
                placeholder="Type, then Enter"
                className="focus-ring h-8 w-48 rounded border border-[var(--color-line)] px-2 text-sm"
              />
            </div>
          )}
        </>
      );
    },
    [
      items,
      preview,
      tool,
      color,
      pageIndex,
      textPending,
      textValue,
      // commitText/commitRect/commitPath are stable enough via closure;
      // exhaustive-deps would want them, but they reference setters only.
    ],
  );

  const onSave = React.useCallback(async () => {
    if (!bytes || items.length === 0) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const specs: AnnotationSpec[] = items.map((it) => it.spec);
      const api = await getPdfApi();
      const out = await api.drawAnnotations(bytes, specs);
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
  }, [bytes, items]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF to annotate"
        hint="Highlight, type, draw shapes, or sketch. Everything bakes into the page when you save."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t save annotations"
        description={errorMsg ?? "Try again with a different file."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    );
  }

  const tools: { id: Tool; label: string }[] = [
    { id: "highlight", label: "Highlight" },
    { id: "text", label: "Text" },
    { id: "rect", label: "Rectangle" },
    { id: "ellipse", label: "Ellipse" },
    { id: "pen", label: "Pen" },
  ];

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
        </div>

        <div className="space-y-4">
          <Card>
            <p className="text-xs tracking-wider text-[var(--color-ink-subtle)] uppercase">
              Tool
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {tools.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTool(t.id)}
                  className={cn(
                    "focus-ring rounded-[var(--radius-sm)] px-3 py-1.5 text-sm",
                    tool === t.id
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-line)]",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs tracking-wider text-[var(--color-ink-subtle)] uppercase">
              Color
            </p>
            <div className="mt-2 flex gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  aria-label={c.name}
                  className={cn(
                    "focus-ring h-7 w-7 rounded-full border-2",
                    color === c.hex
                      ? "border-[var(--color-ink)]"
                      : "border-[var(--color-line)]",
                  )}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Annotations</h3>
              <span className="text-xs text-[var(--color-ink-muted)]">
                {items.length}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                None yet.
              </p>
            ) : (
              <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
                {items.map((it, i) => (
                  <li
                    key={it.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      {it.spec.kind} · p{it.spec.page + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setItems((curr) => curr.filter((_, j) => j !== i))
                      }
                      className="focus-ring text-[var(--color-ink-muted)] hover:text-[var(--color-danger)]"
                      aria-label={`Remove annotation ${i + 1}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div>
            <Label htmlFor="annotate-filename">Filename</Label>
            <Input
              id="annotate-filename"
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
                disabled={phase === "processing" || items.length === 0}
              >
                {phase === "processing"
                  ? "Saving…"
                  : `Save annotations (${items.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
