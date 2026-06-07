"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/States";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";

export type Phase = "empty" | "uploaded" | "processing" | "done" | "error";

export interface ProcessCtx {
  onProgress: (pct: number) => void;
  signal: AbortSignal;
}

export interface ProcessResult {
  bytes: Uint8Array;
  filename: string;
  mime: string;
}

export interface ToolShellProps<TOpts> {
  toolSlug: string;
  accepts: string[];
  multiple?: boolean;
  maxFileSizeMB?: number;
  initialOptions: TOpts;
  process: (
    files: File[],
    opts: TOpts,
    ctx: ProcessCtx,
  ) => Promise<ProcessResult>;
  renderOptions?: (a: {
    opts: TOpts;
    setOpts: (next: TOpts) => void;
    phase: Phase;
    files: File[];
  }) => React.ReactNode;
  primaryActionLabel?: string;
  dropzoneLabel?: React.ReactNode;
  dropzoneHint?: React.ReactNode;
}

export function ToolShell<TOpts>({
  toolSlug,
  accepts,
  multiple = true,
  maxFileSizeMB = 50,
  initialOptions,
  process,
  renderOptions,
  primaryActionLabel = "Process",
  dropzoneLabel,
  dropzoneHint,
}: ToolShellProps<TOpts>) {
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [files, setFiles] = React.useState<File[]>([]);
  const [opts, setOpts] = React.useState<TOpts>(initialOptions);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<ProcessResult | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    track({ type: "tool_viewed", tool: toolSlug });
  }, [toolSlug]);

  // Revoke object URLs on change / unmount
  React.useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const onAccepted = React.useCallback(
    (accepted: File[]) => {
      for (const f of accepted) {
        track({
          type: "file_added",
          tool: toolSlug,
          fileType: f.type || "unknown",
          sizeBucket: bucketBytes(f.size),
        });
      }
      setFiles(accepted);
      setPhase("uploaded");
    },
    [toolSlug],
  );

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResult(null);
    setFiles([]);
    setProgress(0);
    setErrorMsg(null);
    setPhase("empty");
  }, [downloadUrl]);

  const start = React.useCallback(async () => {
    if (files.length === 0) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(0);
    setPhase("processing");
    track({ type: "tool_started", tool: toolSlug });
    const t0 = performance.now();

    try {
      const r = await process(files, opts, {
        onProgress: setProgress,
        signal: controller.signal,
      });
      const blob = new Blob([new Uint8Array(r.bytes)], { type: r.mime });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResult(r);
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
      track({
        type: "tool_failed",
        tool: toolSlug,
        fileType: files[0]?.type || "unknown",
        browser: detectBrowser(),
        sizeBucket: bucketBytes(files[0]?.size || 0),
        reason,
      });
    } finally {
      abortRef.current = null;
    }
  }, [files, opts, process, toolSlug]);

  return (
    <div className="space-y-5">
      {(phase === "empty" || phase === "uploaded") && (
        <Dropzone
          accepts={accepts}
          multiple={multiple}
          maxFileSizeMB={maxFileSizeMB}
          onAccepted={onAccepted}
          label={dropzoneLabel}
          hint={dropzoneHint}
        />
      )}

      {phase === "uploaded" && files.length > 0 && (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">
                {files.length} file{files.length === 1 ? "" : "s"} ready
              </p>
              <ul className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {files.slice(0, 3).map((f) => (
                  <li key={f.name}>
                    {f.name} · {bucketBytes(f.size)}
                  </li>
                ))}
                {files.length > 3 && <li>+ {files.length - 3} more</li>}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={reset}>
                Clear
              </Button>
              <Button onClick={start}>{primaryActionLabel}</Button>
            </div>
          </div>
        </Card>
      )}

      {renderOptions && (phase === "uploaded" || phase === "processing") && (
        <Card variant="muted">
          {renderOptions({ opts, setOpts, phase, files })}
        </Card>
      )}

      {phase === "processing" && (
        <Card>
          <p className="text-sm font-medium">Processing…</p>
          <div
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div
              className="h-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${Math.max(5, Math.round(progress * 100))}%` }}
            />
          </div>
        </Card>
      )}

      {phase === "done" && result && downloadUrl && (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Ready to download</p>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {result.filename}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={reset}>
                Start over
              </Button>
              <a
                href={downloadUrl}
                download={result.filename}
                onClick={() =>
                  track({ type: "download_clicked", tool: toolSlug })
                }
                className="focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Download
              </a>
            </div>
          </div>
        </Card>
      )}

      {phase === "error" && (
        <ErrorState
          title="Something went wrong"
          description={errorMsg || "Please try a different file or try again."}
          action={
            <Button variant="secondary" onClick={reset}>
              Try again
            </Button>
          }
        />
      )}
    </div>
  );
}
