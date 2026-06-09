"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import { ocrSandwich, type OcrProgress } from "@/lib/pdf/ocrSandwich";

type Phase = "empty" | "processing" | "done" | "error";

const TOOL_SLUG = "/ocr-pdf";

export function OcrPdfShell() {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [filename, setFilename] = React.useState("searchable.pdf");
  const [progress, setProgress] = React.useState<OcrProgress | null>(null);
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
    setDownloadUrl(null);
    setErrorMsg(null);
    setProgress(null);
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
    setFilename(file.name.replace(/\.pdf$/i, "") + "-searchable.pdf");
    const buf = new Uint8Array(await file.arrayBuffer());
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const out = await ocrSandwich(buf, { onProgress: setProgress });
      const blob = new Blob([new Uint8Array(out)], {
        type: "application/pdf",
      });
      setDownloadUrl(URL.createObjectURL(blob));
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
        sizeBucket: bucketBytes(buf.byteLength),
        reason,
      });
    }
  }, []);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a scanned PDF to make searchable"
        hint="We OCR each page and bake an invisible text layer behind the image. The output looks identical and is fully selectable."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="OCR failed"
        description={errorMsg ?? "Try again with a different file."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    );
  }

  if (phase === "processing") {
    return (
      <Card>
        <p className="text-sm font-medium">Running OCR…</p>
        {progress && (
          <>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Page {progress.pageIndex + 1} of {progress.total} ·{" "}
              {progress.stage}
            </p>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress.fraction * 100)}
            >
              <div
                className="h-full bg-[var(--color-accent)] transition-all"
                style={{
                  width: `${Math.max(4, Math.round(progress.fraction * 100))}%`,
                }}
              />
            </div>
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <p className="text-sm font-medium">Searchable PDF ready</p>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Open in any reader and try selecting text — it works now.
        </p>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={reset}>
          Start over
        </Button>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={filename}
            onClick={() => track({ type: "download_clicked", tool: TOOL_SLUG })}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}
