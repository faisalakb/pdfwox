"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { PdfPreview } from "@/components/PdfPreview";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { HelpText, Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import type { InspectedField } from "@/lib/pdf/inspect";
import type { FormValues } from "@/lib/pdf/types";
import { getPdfApi } from "@/lib/workers/pdfClient";

type Phase = "empty" | "loading" | "ready" | "processing" | "done" | "error";

const TOOL_SLUG = "/fill-pdf";

export function FillShell() {
  const toast = useToast();
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [originalBytes, setOriginalBytes] = React.useState<Uint8Array | null>(
    null,
  );
  const [filename, setFilename] = React.useState<string>("filled.pdf");
  const [fields, setFields] = React.useState<InspectedField[]>([]);
  const [values, setValues] = React.useState<Record<string, string | boolean>>(
    {},
  );
  const [flatten, setFlatten] = React.useState(false);
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
    setOriginalBytes(null);
    setFields([]);
    setValues({});
    setFlatten(false);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPageIndex(0);
    setPhase("empty");
  }, [downloadUrl]);

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
      setFilename(file.name.replace(/\.pdf$/i, "") + "-filled.pdf");
      setPhase("loading");
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const api = await getPdfApi();
        const inspected = await api.inspectForm(bytes);
        if (inspected.length === 0) {
          toast.push({
            tone: "info",
            title: "No fillable fields found",
            description:
              "This PDF doesn't contain AcroForm fields. Try Annotate PDF to type on top instead.",
          });
          setPhase("empty");
          return;
        }
        setOriginalBytes(bytes);
        setFields(inspected);
        const initial: Record<string, string | boolean> = {};
        for (const f of inspected) {
          if (f.type === "checkbox") initial[f.name] = Boolean(f.value);
          else if (Array.isArray(f.value)) initial[f.name] = f.value[0] ?? "";
          else if (typeof f.value === "string") initial[f.name] = f.value;
          else initial[f.name] = "";
        }
        setValues(initial);
        setPhase("ready");
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        setErrorMsg(reason);
        setPhase("error");
        track({
          type: "tool_failed",
          tool: TOOL_SLUG,
          fileType: file.type || "unknown",
          browser: detectBrowser(),
          sizeBucket: bucketBytes(file.size),
          reason,
        });
      }
    },
    [toast],
  );

  const onSubmit = React.useCallback(async () => {
    if (!originalBytes) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const cleaned: FormValues = {};
      for (const f of fields) {
        const v = values[f.name];
        if (v === undefined) continue;
        if (f.type === "checkbox") cleaned[f.name] = Boolean(v);
        else cleaned[f.name] = String(v);
      }
      const api = await getPdfApi();
      const out = await api.fillForm(originalBytes, cleaned, { flatten });
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
        sizeBucket: bucketBytes(originalBytes.byteLength),
        reason,
      });
    }
  }, [originalBytes, fields, values, flatten]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF with form fields"
        hint="The form must contain AcroForm fields. We'll read them and let you fill each one."
      />
    );
  }

  if (phase === "loading") {
    return (
      <Card>
        <p className="text-sm">Reading form fields…</p>
      </Card>
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn’t process that PDF"
        description={errorMsg ?? "Please try a different file."}
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Preview */}
        <div className="min-w-0">
          {originalBytes ? (
            <PdfPreview
              bytes={originalBytes}
              pageIndex={pageIndex}
              onPageChange={setPageIndex}
            />
          ) : null}
        </div>

        {/* Sidebar form */}
        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-lg">Form fields</h3>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {fields.length} field{fields.length === 1 ? "" : "s"} detected
            </p>
            <div className="mt-4 space-y-4">
              {fields.map((f) => {
                const current = values[f.name];
                if (f.type === "checkbox") {
                  return (
                    <label
                      key={f.name}
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <Checkbox
                        checked={Boolean(current)}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [f.name]: e.target.checked,
                          }))
                        }
                        disabled={phase === "processing"}
                      />
                      <span className="text-sm font-medium">{f.name}</span>
                    </label>
                  );
                }
                if (f.type === "dropdown" && f.options?.length) {
                  return (
                    <div key={f.name}>
                      <Label htmlFor={`fld-${f.name}`}>{f.name}</Label>
                      <Select
                        id={`fld-${f.name}`}
                        value={typeof current === "string" ? current : ""}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [f.name]: e.target.value,
                          }))
                        }
                        disabled={phase === "processing"}
                      >
                        <option value="">— Choose —</option>
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                }
                if (f.type === "signature") {
                  return (
                    <div key={f.name}>
                      <Label htmlFor={`fld-${f.name}`}>{f.name}</Label>
                      <Input
                        id={`fld-${f.name}`}
                        value={typeof current === "string" ? current : ""}
                        onChange={(e) =>
                          setValues((v) => ({
                            ...v,
                            [f.name]: e.target.value,
                          }))
                        }
                        placeholder="Type your name to sign"
                        disabled={phase === "processing"}
                      />
                      <HelpText>
                        Cryptographic signing arrives with Sign PDF.
                      </HelpText>
                    </div>
                  );
                }
                if (f.type === "button" || f.type === "unknown") return null;
                return (
                  <div key={f.name}>
                    <Label htmlFor={`fld-${f.name}`}>{f.name}</Label>
                    <Input
                      id={`fld-${f.name}`}
                      value={typeof current === "string" ? current : ""}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [f.name]: e.target.value,
                        }))
                      }
                      disabled={phase === "processing"}
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="muted">
            <label className="flex cursor-pointer items-start gap-3">
              <Checkbox
                checked={flatten}
                onChange={(e) => setFlatten(e.target.checked)}
                disabled={phase === "processing"}
              />
              <span>
                <span className="block text-sm font-medium">
                  Flatten on download
                </span>
                <span className="block text-xs text-[var(--color-ink-muted)]">
                  Locks the values so recipients can’t edit them.
                </span>
              </span>
            </label>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Label htmlFor="fill-filename">Filename</Label>
              <Input
                id="fill-filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={phase === "processing"}
                className="w-60"
              />
            </div>
            <div className="flex gap-2">
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
                <Button onClick={onSubmit} disabled={phase === "processing"}>
                  {phase === "processing" ? "Working…" : "Fill & download"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
