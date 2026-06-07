"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Presentational drop zone. Two modes:
 *
 * 1. **Standalone** (default) — manages its own drag state and native input;
 *    used by simple homepage previews.
 * 2. **Composed** — pass `rootProps`/`inputProps` from react-dropzone
 *    (used by `Dropzone.tsx`) and we render *only the visual chrome*.
 *
 * Reserved min-height prevents CLS when heavier siblings hydrate.
 */
export interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: FileList) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  // Composition slots (react-dropzone)
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  state?: "idle" | "dragging" | "invalid";
}

export function FileUploader({
  accept,
  multiple = false,
  onFiles,
  label = "Drop your file here, or click to choose",
  hint = "Files stay on your device. Nothing is uploaded.",
  className,
  rootProps,
  inputProps,
  state,
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localDragging, setLocalDragging] = React.useState(false);

  const composed = Boolean(rootProps || inputProps);
  const dragging =
    state === "dragging" || (state === undefined && localDragging);
  const invalid = state === "invalid";

  // Drag handlers only apply in standalone mode; in composed mode
  // react-dropzone supplies them via rootProps.
  const standaloneRootProps: React.HTMLAttributes<HTMLDivElement> = composed
    ? {}
    : {
        onDragOver: (e) => {
          e.preventDefault();
          setLocalDragging(true);
        },
        onDragLeave: () => setLocalDragging(false),
        onDrop: (e) => {
          e.preventDefault();
          setLocalDragging(false);
          if (e.dataTransfer.files.length && onFiles)
            onFiles(e.dataTransfer.files);
        },
      };

  const borderClass = invalid
    ? "border-[var(--color-danger)] bg-[var(--color-danger-soft)]"
    : dragging
      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
      : "border-[var(--color-line-strong)] hover:border-[var(--color-accent)]";

  return (
    <div
      {...standaloneRootProps}
      {...rootProps}
      className={cn(
        "no-cls-min relative flex flex-col items-center justify-center text-center",
        "rounded-[var(--radius-xl)] border-2 border-dashed bg-[var(--color-surface)] p-10 transition-colors",
        borderClass,
        className,
        rootProps?.className,
      )}
    >
      {composed ? (
        <input {...inputProps} className="sr-only" />
      ) : (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length && onFiles) onFiles(e.target.files);
          }}
        />
      )}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
        className="mb-4 h-12 w-12 text-[var(--color-accent)]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M24 8v22m0 0l-8-8m8 8l8-8M8 36v2a4 4 0 004 4h24a4 4 0 004-4v-2"
        />
      </svg>
      <p className="text-lg font-medium">{label}</p>
      {hint && (
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{hint}</p>
      )}
      {!composed && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="focus-ring mt-5 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] px-5 text-base font-medium text-[var(--color-accent-ink)] transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Choose file
        </button>
      )}
    </div>
  );
}
