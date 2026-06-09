"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { HelpText, Textarea } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import { extractText } from "@/lib/pdf/extractText";
import { ocrSandwich, type OcrProgress } from "@/lib/pdf/ocrSandwich";

type Phase = "empty" | "extracting" | "ocr" | "done" | "error";

const TOOL_SLUG = "/pdf-to-text";

export function PdfToTextShell() {
  const toast = useToast();
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [text, setText] = React.useState("");
  const [filename, setFilename] = React.useState("extracted-text.txt");
  const [allowOcr, setAllowOcr] = React.useState(true);
  const [progress, setProgress] = React.useState<OcrProgress | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

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
    setText("");
    setDownloadUrl(null);
    setErrorMsg(null);
    setProgress(null);
    setPhase("empty");
  }, [downloadUrl]);

  const buildDownload = React.useCallback((value: string) => {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    setDownloadUrl(URL.createObjectURL(blob));
  }, []);

  const onAccepted = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      track({
        type: "file_added",
        tool: TOOL_SLUG,
        fileType: file.type || "application/pdf",
        sizeBucket: bucketBytes(file.size),
      });
      setFilename(file.name.replace(/\.pdf$/i, "") + ".txt");
      const buf = new Uint8Array(await file.arrayBuffer());
      setPhase("extracting");
      track({ type: "tool_started", tool: TOOL_SLUG });
      const t0 = performance.now();
      try {
        const extracted = await extractText(buf);
        if (!extracted.likelyScan) {
          setText(extracted.fullText);
          buildDownload(extracted.fullText);
          setPhase("done");
          track({
            type: "tool_succeeded",
            tool: TOOL_SLUG,
            durationMs: Math.round(performance.now() - t0),
          });
          return;
        }
        if (!allowOcr) {
          throw new Error(
            "This PDF looks like a scan and has no extractable text. Enable OCR to read it.",
          );
        }
        toast.push({
          tone: "info",
          title: "Looks like a scan — running OCR",
          description:
            "First run downloads the language model; subsequent runs are fast.",
        });
        setPhase("ocr");
        const sandwiched = await ocrSandwich(buf, {
          onProgress: setProgress,
        });
        const reExtracted = await extractText(sandwiched);
        setText(reExtracted.fullText);
        buildDownload(reExtracted.fullText);
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
    },
    [allowOcr, buildDownload, toast],
  );

  if (phase === "empty") {
    return (
      <div className="space-y-4">
        <Dropzone
          accepts={["application/pdf"]}
          multiple={false}
          onAccepted={onAccepted}
          label="Drop a PDF to extract text"
          hint="Text-based PDFs extract instantly. Scanned PDFs go through OCR — that takes a minute on the first run."
        />
        <Card variant="muted">
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox
              checked={allowOcr}
              onChange={(e) => setAllowOcr(e.target.checked)}
            />
            <span className="text-sm">
              Run OCR if the PDF is a scan (downloads a ~3 MB language model on
              first use)
            </span>
          </label>
        </Card>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t extract text"
        description={errorMsg ?? "Try a different file."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    );
  }

  if (phase === "extracting" || phase === "ocr") {
    return (
      <Card>
        <p className="text-sm font-medium">
          {phase === "extracting" ? "Reading text…" : "Running OCR…"}
        </p>
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
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg">Extracted text</h3>
          <span className="text-xs text-[var(--color-ink-muted)]">
            {text.length.toLocaleString()} chars
          </span>
        </div>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            buildDownload(e.target.value);
          }}
          rows={12}
          className="font-mono text-sm"
        />
        <HelpText>
          Edit before downloading if you want to clean up artifacts.
        </HelpText>
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
            Download .txt
          </a>
        )}
      </div>
    </div>
  );
}
