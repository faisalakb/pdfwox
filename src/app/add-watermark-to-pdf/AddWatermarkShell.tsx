"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input, Label, HelpText } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import type {
  AddWatermarkSpec,
  WatermarkPosition,
} from "@/lib/pdf/addWatermark";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "editing" | "processing" | "done" | "error";
type Source = "text" | "image";

const TOOL_SLUG = "/add-watermark-to-pdf";

const POSITIONS: WatermarkPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export function AddWatermarkShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [previewBytes, setPreviewBytes] = React.useState<Uint8Array | null>(
    null,
  );
  const [pageIndex, setPageIndex] = React.useState(0);
  const [filename, setFilename] = React.useState("watermarked.pdf");
  const [source, setSource] = React.useState<Source>("text");
  const [text, setText] = React.useState("CONFIDENTIAL");
  const [color, setColor] = React.useState("#1a1a1f");
  const [size, setSize] = React.useState(48);
  const [opacity, setOpacity] = React.useState(0.25);
  const [position, setPosition] = React.useState<WatermarkPosition>("center");
  const [tile, setTile] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const [imageBytes, setImageBytes] = React.useState<Uint8Array | null>(null);
  const [imageMime, setImageMime] = React.useState<"image/png" | "image/jpeg">(
    "image/png",
  );
  const [imageWidth, setImageWidth] = React.useState(200);
  const [usePageRange, setUsePageRange] = React.useState(false);
  const [fromPage, setFromPage] = React.useState(1);
  const [toPage, setToPage] = React.useState(1);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const previewSeqRef = React.useRef(0);

  React.useEffect(() => {
    track({ type: "tool_viewed", tool: TOOL_SLUG });
  }, []);

  React.useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const buildSpec = React.useCallback((): AddWatermarkSpec | null => {
    if (source === "text") {
      if (!text.trim()) return null;
      return {
        source: { kind: "text", text, color, size },
        opacity,
        position,
        tile,
        rotation,
        pageRange: usePageRange
          ? { from: fromPage - 1, to: toPage - 1 }
          : undefined,
      };
    }
    if (!imageBytes) return null;
    return {
      source: {
        kind: "image",
        bytes: imageBytes,
        mime: imageMime,
        width: imageWidth,
      },
      opacity,
      position,
      tile,
      rotation,
      pageRange: usePageRange
        ? { from: fromPage - 1, to: toPage - 1 }
        : undefined,
    };
  }, [
    source,
    text,
    color,
    size,
    opacity,
    position,
    tile,
    rotation,
    imageBytes,
    imageMime,
    imageWidth,
    usePageRange,
    fromPage,
    toPage,
  ]);

  // Live preview — debounced via a sequence ref so we only show the latest.
  React.useEffect(() => {
    if (!bytes || phase === "empty" || phase === "processing") return;
    const spec = buildSpec();
    if (!spec) return; // preview stays at the last good frame
    const seq = ++previewSeqRef.current;
    const handle = setTimeout(async () => {
      try {
        const api = await getPdfApi();
        const out = await api.addWatermark(bytes, spec);
        if (seq === previewSeqRef.current) {
          setPreviewBytes(new Uint8Array(out));
        }
      } catch {
        // ignore preview errors; final save will surface them
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [bytes, phase, buildSpec]);

  const onAccepted = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    track({
      type: "file_added",
      tool: TOOL_SLUG,
      fileType: file.type || "application/pdf",
      sizeBucket: bucketBytes(file.size),
    });
    setFilename(file.name.replace(/\.pdf$/i, "") + "-watermarked.pdf");
    const buf = new Uint8Array(await file.arrayBuffer());
    setBytes(buf);
    setPreviewBytes(buf);
    setPhase("editing");
  }, []);

  const onImagePicked = React.useCallback(async (file: File) => {
    if (file.type !== "image/png" && file.type !== "image/jpeg") return;
    setImageMime(file.type);
    setImageBytes(new Uint8Array(await file.arrayBuffer()));
  }, []);

  const reset = React.useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setBytes(null);
    setPreviewBytes(null);
    setPageIndex(0);
    setText("CONFIDENTIAL");
    setImageBytes(null);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase("empty");
  }, [downloadUrl]);

  const onSave = React.useCallback(async () => {
    if (!bytes) return;
    const spec = buildSpec();
    if (!spec) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const api = await getPdfApi();
      const out = await api.addWatermark(bytes, spec);
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
  }, [bytes, buildSpec]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF to watermark"
        hint="Text or image watermark. Opacity, position, rotation, tiling — everything bakes into the file."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t save watermark"
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {previewBytes ? (
            <PdfPreview
              bytes={previewBytes}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
            />
          ) : null}
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Live preview — your change appears in the page above as you tweak
            the controls.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex gap-1">
              {(["text", "image"] as Source[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={cn(
                    "focus-ring flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm",
                    source === s
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-line)]",
                  )}
                >
                  {s === "text" ? "Text" : "Image"}
                </button>
              ))}
            </div>

            {source === "text" ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="wm-text">Watermark text</Label>
                  <Input
                    id="wm-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="wm-size">Size</Label>
                    <Input
                      id="wm-size"
                      type="number"
                      min={8}
                      max={144}
                      value={size}
                      onChange={(e) =>
                        setSize(
                          Math.max(
                            8,
                            Math.min(144, Number(e.target.value) || 0),
                          ),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="wm-color">Color</Label>
                    <input
                      id="wm-color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="focus-ring h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="wm-image">Image (PNG or JPG)</Label>
                <input
                  id="wm-image"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onImagePicked(f);
                  }}
                  className="focus-ring block w-full text-sm"
                />
                {imageBytes && (
                  <div>
                    <Label htmlFor="wm-image-width">Width (pt)</Label>
                    <Input
                      id="wm-image-width"
                      type="number"
                      min={20}
                      max={1000}
                      value={imageWidth}
                      onChange={(e) =>
                        setImageWidth(
                          Math.max(
                            20,
                            Math.min(1000, Number(e.target.value) || 0),
                          ),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card>
            <Label>Opacity ({Math.round(opacity * 100)}%)</Label>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-1 w-full"
              aria-label="Opacity"
            />
            <Label className="mt-3">Rotation ({rotation}°)</Label>
            <input
              type="range"
              min={-90}
              max={90}
              step={5}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="mt-1 w-full"
              aria-label="Rotation"
            />
            <label className="mt-3 flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={tile}
                onChange={(e) => setTile(e.target.checked)}
              />
              <span className="text-sm">Tile diagonally across the page</span>
            </label>
          </Card>

          <Card>
            <Label className="mb-2">Position</Label>
            <div
              className={cn(
                "grid grid-cols-3 gap-1.5",
                tile && "pointer-events-none opacity-40",
              )}
            >
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-label={p}
                  aria-pressed={position === p}
                  onClick={() => setPosition(p)}
                  className={cn(
                    "focus-ring aspect-square rounded-[var(--radius-sm)] border text-[10px]",
                    position === p
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                      : "border-[var(--color-line)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]",
                  )}
                >
                  {p
                    .split("-")
                    .map((s) => s[0]?.toUpperCase())
                    .join("")}
                </button>
              ))}
            </div>
            {tile && <HelpText>Position is disabled while tiling.</HelpText>}
          </Card>

          <Card variant="muted">
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={usePageRange}
                onChange={(e) => setUsePageRange(e.target.checked)}
              />
              <span className="text-sm">Apply to a page range</span>
            </label>
            {usePageRange && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="wm-from">From page</Label>
                  <Input
                    id="wm-from"
                    type="number"
                    min={1}
                    value={fromPage}
                    onChange={(e) =>
                      setFromPage(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="wm-to">To page</Label>
                  <Input
                    id="wm-to"
                    type="number"
                    min={1}
                    value={toPage}
                    onChange={(e) =>
                      setToPage(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </div>
              </div>
            )}
          </Card>

          <div>
            <Label htmlFor="wm-filename">Filename</Label>
            <Input
              id="wm-filename"
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
                  phase === "processing" ||
                  (source === "image" && !imageBytes) ||
                  (source === "text" && !text.trim())
                }
              >
                {phase === "processing" ? "Saving…" : "Save & download"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
