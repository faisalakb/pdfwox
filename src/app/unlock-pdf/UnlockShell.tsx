"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HelpText, Input, Label } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import { looksEncrypted, qpdfUnlock } from "@/lib/pdf/qpdf";

type Phase = "empty" | "ready" | "processing" | "done" | "error";

const TOOL_SLUG = "/unlock-pdf";

export function UnlockShell() {
  const toast = useToast();
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [filename, setFilename] = React.useState("unlocked.pdf");
  const [password, setPassword] = React.useState("");
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
    setPassword("");
    setDownloadUrl(null);
    setErrorMsg(null);
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
      setFilename(file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf");
      const buf = new Uint8Array(await file.arrayBuffer());
      setBytes(buf);
      if (!looksEncrypted(buf)) {
        toast.push({
          tone: "info",
          title: "This PDF doesn't look encrypted",
          description:
            "You can still try — but if there's no password set, there's nothing to unlock.",
        });
      }
      setPhase("ready");
    },
    [toast],
  );

  const onSubmit = React.useCallback(async () => {
    if (!bytes) return;
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const out = await qpdfUnlock(bytes, password);
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
      const raw = e instanceof Error ? e.message : String(e);
      const reason = /password|invalid/i.test(raw)
        ? "Wrong password — couldn't decrypt the PDF with that password."
        : raw;
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
  }, [bytes, password]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a password-protected PDF"
        hint="You'll need the password to unlock it. This tool doesn't crack unknown passwords."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn't unlock that PDF"
        description={errorMsg ?? "Please try again."}
        action={
          <Button variant="secondary" onClick={reset}>
            Try a different file
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <Label htmlFor="unlock-password">PDF password</Label>
        <Input
          id="unlock-password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={phase === "processing" || phase === "done"}
          placeholder="The password used to open this file"
        />
        <HelpText>
          Your password is used locally in your browser and is never sent
          anywhere.
        </HelpText>
      </Card>
      <Card variant="muted">
        <Label htmlFor="unlock-filename">Filename</Label>
        <Input
          id="unlock-filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          disabled={phase === "processing"}
        />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={reset}>
          Start over
        </Button>
        {phase === "done" && downloadUrl ? (
          <a
            href={downloadUrl}
            download={filename}
            onClick={() => track({ type: "download_clicked", tool: TOOL_SLUG })}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
          >
            Download
          </a>
        ) : (
          <Button onClick={onSubmit} disabled={phase === "processing"}>
            {phase === "processing" ? "Unlocking…" : "Unlock & download"}
          </Button>
        )}
      </div>
    </div>
  );
}
