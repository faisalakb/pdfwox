"use client";

import { ToolShell, type ProcessResult } from "@/components/ToolShell";
import { getPdfApi, proxyProgress } from "@/lib/workers/pdfClient";

interface DemoOpts {
  filename: string;
}

export function DemoMergeShell() {
  return (
    <ToolShell<DemoOpts>
      toolSlug="/dev/demo-merge"
      accepts={["application/pdf"]}
      multiple
      initialOptions={{ filename: "merged.pdf" }}
      primaryActionLabel="Merge"
      dropzoneLabel="Drop two or more PDFs"
      dropzoneHint="Files stay on your device. Nothing is uploaded."
      process={async (files, opts, ctx) => {
        const bytes = await Promise.all(
          files.map(async (f) => new Uint8Array(await f.arrayBuffer())),
        );
        if (ctx.signal.aborted) throw new Error("Aborted");
        const api = await getPdfApi();
        const merged = await api.merge(bytes, proxyProgress(ctx.onProgress));
        const result: ProcessResult = {
          bytes: merged,
          filename: opts.filename,
          mime: "application/pdf",
        };
        return result;
      }}
      renderOptions={({ opts, setOpts, phase }) => (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="filename" className="text-sm font-medium">
            Output filename
          </label>
          <input
            id="filename"
            type="text"
            value={opts.filename}
            disabled={phase === "processing"}
            onChange={(e) => setOpts({ filename: e.target.value })}
            className="focus-ring h-10 flex-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3"
          />
        </div>
      )}
    />
  );
}
