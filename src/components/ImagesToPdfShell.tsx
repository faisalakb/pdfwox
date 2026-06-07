"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HelpText, Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import { heicToJpeg } from "@/lib/pdf/heicDecode";
import type { ImagesToPdfOptions, PageSize } from "@/lib/pdf/types";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "ready" | "processing" | "done" | "error";

export interface ImagesToPdfShellProps {
  toolSlug: string;
  /** MIME types this tool accepts in the Dropzone. */
  accepts: string[];
  /** Default filename hint. */
  defaultFilename?: string;
  /** Whether to decode HEIC items via heic2any before embedding. */
  enableHeic?: boolean;
  dropzoneLabel?: React.ReactNode;
  dropzoneHint?: React.ReactNode;
}

interface ImageEntry {
  id: string;
  file: File;
  url: string;
  mime: string; // after decoding HEIC → image/jpeg
  bytes?: Uint8Array; // populated for HEIC after decode
}

const PAGE_SIZES: PageSize[] = ["A4", "Letter", "Fit"];

export function ImagesToPdfShell({
  toolSlug,
  accepts,
  defaultFilename = "images.pdf",
  enableHeic = false,
  dropzoneLabel,
  dropzoneHint,
}: ImagesToPdfShellProps) {
  const toast = useToast();
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [entries, setEntries] = React.useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = React.useState<PageSize>("Fit");
  const [margin, setMargin] = React.useState<ImagesToPdfOptions["margin"]>(
    "narrow",
  );
  const [filename, setFilename] = React.useState(defaultFilename);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const dragId = React.useRef<string | null>(null);

  React.useEffect(() => {
    track({ type: "tool_viewed", tool: toolSlug });
  }, [toolSlug]);

  React.useEffect(() => {
    return () => {
      for (const e of entries) URL.revokeObjectURL(e.url);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAccepted = React.useCallback(
    async (files: File[]) => {
      const next: ImageEntry[] = [];
      for (const f of files) {
        track({
          type: "file_added",
          tool: toolSlug,
          fileType: f.type || "unknown",
          sizeBucket: bucketBytes(f.size),
        });
        next.push({
          id: `${f.name}-${f.size}-${f.lastModified}-${Math.random()}`,
          file: f,
          url: URL.createObjectURL(f),
          mime: f.type,
        });
      }
      setEntries((prev) => [...prev, ...next]);
      setPhase("ready");
    },
    [toolSlug],
  );

  const remove = React.useCallback((id: string) => {
    setEntries((prev) => {
      const found = prev.find((e) => e.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const moveTo = React.useCallback((fromId: string, toId: string) => {
    setEntries((prev) => {
      const fromIdx = prev.findIndex((e) => e.id === fromId);
      const toIdx = prev.findIndex((e) => e.id === toId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev;
      const out = prev.slice();
      const [m] = out.splice(fromIdx, 1);
      if (m) out.splice(toIdx, 0, m);
      return out;
    });
  }, []);

  const reset = React.useCallback(() => {
    for (const e of entries) URL.revokeObjectURL(e.url);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setEntries([]);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPhase("empty");
  }, [entries, downloadUrl]);

  const start = React.useCallback(async () => {
    if (entries.length === 0) return;
    setPhase("processing");
    track({ type: "tool_started", tool: toolSlug });
    const t0 = performance.now();
    try {
      // Decode HEIC files in-place so the worker only sees PNG/JPG.
      const items: { bytes: Uint8Array; mime: string }[] = [];
      for (const e of entries) {
        const buf = e.bytes ?? new Uint8Array(await e.file.arrayBuffer());
        const isHeic =
          e.mime === "image/heic" ||
          e.mime === "image/heif" ||
          /\.heic$|\.heif$/i.test(e.file.name);
        if (isHeic) {
          if (!enableHeic) {
            throw new Error("HEIC files aren't supported by this tool");
          }
          const jpeg = await heicToJpeg(buf);
          items.push({ bytes: jpeg, mime: "image/jpeg" });
        } else if (e.mime === "image/png" || e.mime === "image/jpeg") {
          items.push({ bytes: buf, mime: e.mime });
        } else {
          throw new Error(`Unsupported file type: ${e.mime || e.file.name}`);
        }
      }
      const api = await getPdfApi();
      const out = await api.imagesToPdf(items, { pageSize, margin });
      const blob = new Blob([new Uint8Array(out)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setPhase("done");
      track({
        type: "tool_succeeded",
        tool: toolSlug,
        durationMs: Math.round(performance.now() - t0),
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      setErrorMsg(reason);
      setPhase("error");
      toast.push({
        tone: "error",
        title: "Conversion failed",
        description: reason,
      });
      track({
        type: "tool_failed",
        tool: toolSlug,
        fileType: entries[0]?.mime || "unknown",
        browser: detectBrowser(),
        sizeBucket: bucketBytes(entries[0]?.file.size || 0),
        reason,
      });
    }
  }, [entries, pageSize, margin, enableHeic, toolSlug, toast]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={accepts}
        multiple
        onAccepted={onAccepted}
        label={dropzoneLabel}
        hint={dropzoneHint}
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t create your PDF"
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
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">
            {entries.length} image{entries.length === 1 ? "" : "s"}
          </h3>
          <span className="text-xs text-[var(--color-ink-muted)]">
            Drag thumbnails to reorder
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map((e, i) => (
            <li
              key={e.id}
              draggable
              onDragStart={() => {
                dragId.current = e.id;
              }}
              onDragOver={(ev) => ev.preventDefault()}
              onDrop={() => {
                if (dragId.current && dragId.current !== e.id) {
                  moveTo(dragId.current, e.id);
                }
                dragId.current = null;
              }}
              className="group relative cursor-grab overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] active:cursor-grabbing"
            >
              {/* For HEIC, browsers won't show a preview — show a label instead. */}
              {e.mime === "image/heic" ||
              e.mime === "image/heif" ||
              /\.heic$|\.heif$/i.test(e.file.name) ? (
                <div className="flex aspect-square items-center justify-center bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                  HEIC
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.url}
                  alt=""
                  className="block aspect-square h-auto w-full object-cover"
                />
              )}
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-1.5 text-[10px] text-white">
                <span>{i + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  aria-label={`Remove ${e.file.name}`}
                  className="focus-ring rounded bg-white/15 px-1.5 hover:bg-white/30"
                >
                  ×
                </button>
              </div>
              <p className="truncate p-1.5 text-[10px] text-[var(--color-ink-muted)]">
                {e.file.name}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="muted">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="page-size">Page size</Label>
            <Select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as PageSize)}
              disabled={phase === "processing"}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s === "Fit" ? "Fit to image" : s}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="margin">Margin</Label>
            <Select
              id="margin"
              value={margin}
              onChange={(e) =>
                setMargin(e.target.value as ImagesToPdfOptions["margin"])
              }
              disabled={phase === "processing"}
            >
              <option value="none">None</option>
              <option value="narrow">Narrow</option>
              <option value="normal">Normal</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={phase === "processing"}
            />
            <HelpText>The downloaded file name.</HelpText>
          </div>
        </div>
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
              track({ type: "download_clicked", tool: toolSlug })
            }
            className="focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Download
          </a>
        ) : (
          <Button onClick={start} disabled={phase === "processing"}>
            {phase === "processing" ? "Working…" : "Make PDF"}
          </Button>
        )}
      </div>
    </div>
  );
}
