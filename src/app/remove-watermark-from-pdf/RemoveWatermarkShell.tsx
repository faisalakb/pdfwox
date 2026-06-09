"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { HelpText, Input, Label } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import {
  detectWatermarks,
  type WatermarkCandidate,
} from "@/lib/pdf/detectWatermarks";
import type { CoverRect } from "@/lib/pdf/coverWatermarks";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "scanning" | "ready" | "processing" | "done" | "error";

const TOOL_SLUG = "/remove-watermark-from-pdf";

export function RemoveWatermarkShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [candidates, setCandidates] = React.useState<WatermarkCandidate[]>([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [color, setColor] = React.useState("#ffffff");
  const [filename, setFilename] = React.useState("watermark-removed.pdf");
  const [pageIndex, setPageIndex] = React.useState(0);
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

  const reset = React.useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setBytes(null);
    setCandidates([]);
    setPageCount(0);
    setSelected(new Set());
    setDownloadUrl(null);
    setErrorMsg(null);
    setPageIndex(0);
    setPhase("empty");
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
    setFilename(file.name.replace(/\.pdf$/i, "") + "-no-watermark.pdf");
    const buf = new Uint8Array(await file.arrayBuffer());
    setBytes(buf);
    setPhase("scanning");
    try {
      const found = await detectWatermarks(buf);
      // Get page count for the honesty message.
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) })
        .promise;
      setPageCount(doc.numPages);
      setCandidates(found);
      setPhase("ready");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }, []);

  const toggle = (text: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  const onSave = React.useCallback(async () => {
    if (!bytes || selected.size === 0) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const rects: CoverRect[] = [];
      for (const c of candidates) {
        if (!selected.has(c.text)) continue;
        for (const occ of c.occurrences) {
          // pdf.js sometimes reports width=0 for short strings; estimate
          // ~6pt per char as a safe fallback so the cover rect still hides
          // the visible glyphs.
          const estimatedWidth = c.text.length * 6;
          rects.push({
            page: occ.page,
            x: occ.x,
            y: occ.y - occ.height * 0.2,
            width: occ.width > 0 ? occ.width : estimatedWidth,
            height: occ.height * 1.4,
            padding: 2,
          });
        }
      }
      const api = await getPdfApi();
      const out = await api.coverWatermarks(bytes, rects, { color });
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
  }, [bytes, candidates, selected, color]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF with a watermark to remove"
        hint="We scan for overlay text watermarks. Flattened-image watermarks (baked into page images) can't be removed."
      />
    );
  }

  if (phase === "scanning") {
    return (
      <Card>
        <p className="text-sm">Scanning pages for watermark candidates…</p>
      </Card>
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t process that PDF"
        description={errorMsg ?? "Try a different file."}
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
      <Card variant="muted">
        <p className="text-sm text-[var(--color-ink)]">
          <strong>What we can do:</strong> if a watermark is overlay text (the
          kind you can select in Adobe Reader), we cover each occurrence with a
          solid-color rectangle in the matching background color.{" "}
          <strong>What we can&apos;t do:</strong> remove watermarks baked into a
          page image (scanned PDFs, flattened exports). Those need the page
          itself rebuilt — a manual job for a real editor.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {bytes ? (
            <PdfPreview
              bytes={bytes}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
            />
          ) : null}
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Preview of the original.{" "}
            {candidates.length === 0
              ? "We didn't find any overlay text on most pages."
              : "Pick the candidates that look like watermarks on the right."}
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-lg">Detected text</h3>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {candidates.length === 0
                ? `No text appears on enough pages (${pageCount} total) to look like a watermark. If yours is a flattened image, this tool can't help.`
                : `Text that appears on most of the ${pageCount} pages.`}
            </p>
            {candidates.length > 0 && (
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {candidates.map((c) => {
                  const isSel = selected.has(c.text);
                  return (
                    <li key={c.text}>
                      <label className="flex cursor-pointer items-start gap-2.5">
                        <Checkbox
                          checked={isSel}
                          onChange={() => toggle(c.text)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium" title={c.text}>
                            {c.text}
                          </p>
                          <p className="text-xs text-[var(--color-ink-muted)]">
                            Appears on {Math.round(c.coverage * 100)}% of pages
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card variant="muted">
            <Label htmlFor="rmwm-color">Cover color</Label>
            <input
              id="rmwm-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="focus-ring h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line)]"
            />
            <HelpText>
              Match your page background. White works for most documents.
            </HelpText>
          </Card>

          <div>
            <Label htmlFor="rmwm-filename">Filename</Label>
            <Input
              id="rmwm-filename"
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
                disabled={phase === "processing" || selected.size === 0}
              >
                {phase === "processing"
                  ? "Removing…"
                  : `Cover & download (${selected.size})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
