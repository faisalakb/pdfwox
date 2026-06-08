"use client";

import * as React from "react";
import { Dropzone } from "@/components/Dropzone";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { HelpText, Input, Label } from "@/components/ui/Input";
import { ErrorState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { bucketBytes, detectBrowser, track } from "@/lib/analytics";
import { qpdfProtect } from "@/lib/pdf/qpdf";

type Phase = "empty" | "ready" | "processing" | "done" | "error";

const TOOL_SLUG = "/protect-pdf";

export function ProtectShell() {
  const toast = useToast();
  const [phase, setPhase] = React.useState<Phase>("empty");
  const [bytes, setBytes] = React.useState<Uint8Array | null>(null);
  const [filename, setFilename] = React.useState("protected.pdf");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [perms, setPerms] = React.useState({
    print: true,
    modify: true,
    extract: true,
    annotate: true,
  });
  const [showPerms, setShowPerms] = React.useState(false);
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
    setConfirm("");
    setDownloadUrl(null);
    setErrorMsg(null);
    setPerms({ print: true, modify: true, extract: true, annotate: true });
    setShowPerms(false);
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
    setFilename(file.name.replace(/\.pdf$/i, "") + "-protected.pdf");
    const buf = new Uint8Array(await file.arrayBuffer());
    setBytes(buf);
    setPhase("ready");
  }, []);

  const onSubmit = React.useCallback(async () => {
    if (!bytes) return;
    if (!password) {
      toast.push({
        tone: "error",
        title: "Password required",
        description: "Set a password to encrypt the PDF.",
      });
      return;
    }
    if (password !== confirm) {
      toast.push({
        tone: "error",
        title: "Passwords don't match",
        description: "Confirm the password to continue.",
      });
      return;
    }
    setPhase("processing");
    track({ type: "tool_started", tool: TOOL_SLUG });
    const t0 = performance.now();
    try {
      const out = await qpdfProtect(bytes, {
        userPassword: password,
        permissions: perms,
      });
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
  }, [bytes, password, confirm, perms, toast]);

  if (phase === "empty") {
    return (
      <Dropzone
        accepts={["application/pdf"]}
        multiple={false}
        onAccepted={onAccepted}
        label="Drop a PDF to protect"
        hint="Set a password and pick which actions you want to restrict."
      />
    );
  }

  if (phase === "error") {
    return (
      <ErrorState
        title="Couldn't protect that PDF"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="protect-password">Password</Label>
            <Input
              id="protect-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={phase === "processing" || phase === "done"}
            />
          </div>
          <div>
            <Label htmlFor="protect-confirm">Confirm</Label>
            <Input
              id="protect-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={phase === "processing" || phase === "done"}
            />
          </div>
        </div>
        <HelpText>
          We use AES-256 encryption. If you lose this password, the PDF
          can&apos;t be recovered.
        </HelpText>
      </Card>

      <Card variant="muted">
        <button
          type="button"
          onClick={() => setShowPerms((v) => !v)}
          className="focus-ring inline-flex items-center gap-1.5 text-sm font-medium"
          aria-expanded={showPerms}
        >
          <span aria-hidden="true">{showPerms ? "▾" : "▸"}</span>
          Restrictions {showPerms ? "" : "(advanced)"}
        </button>
        {showPerms && (
          <div className="mt-4 space-y-2.5">
            {(
              [
                ["print", "Allow printing"],
                ["modify", "Allow modifying content"],
                ["extract", "Allow copying text/images"],
                ["annotate", "Allow adding annotations"],
              ] as Array<[keyof typeof perms, string]>
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3"
              >
                <Checkbox
                  checked={perms[key]}
                  onChange={(e) =>
                    setPerms((p) => ({ ...p, [key]: e.target.checked }))
                  }
                  disabled={phase === "processing" || phase === "done"}
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
            <HelpText>
              Restrictions are advisory — some tools can bypass them. For real
              confidentiality, rely on a strong open password.
            </HelpText>
          </div>
        )}
      </Card>

      <Card>
        <Label htmlFor="protect-filename">Filename</Label>
        <Input
          id="protect-filename"
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
            {phase === "processing" ? "Encrypting…" : "Protect & download"}
          </Button>
        )}
      </div>
    </div>
  );
}
