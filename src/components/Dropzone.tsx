"use client";

import * as React from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { FileUploader } from "@/components/ui/FileUploader";
import { useToast } from "@/components/ui/Toast";
import { bucketBytes } from "@/lib/analytics";

export interface DropzoneProps {
  accepts: string[]; // MIME types (e.g. "application/pdf", "image/png")
  multiple?: boolean;
  maxFileSizeMB?: number;
  onAccepted: (files: File[]) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}

function toAcceptMap(mimes: string[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const m of mimes) map[m] = [];
  return map;
}

export function Dropzone({
  accepts,
  multiple = true,
  maxFileSizeMB = 50,
  onAccepted,
  label,
  hint,
  className,
}: DropzoneProps) {
  const toast = useToast();
  const maxBytes = maxFileSizeMB * 1024 * 1024;

  const onDrop = React.useCallback(
    (accepted: File[]) => {
      if (accepted.length) onAccepted(accepted);
    },
    [onAccepted],
  );

  const onDropRejected = React.useCallback(
    (rejections: FileRejection[]) => {
      const r = rejections[0];
      if (!r) return;
      const err = r.errors[0]?.code;
      if (err === "file-too-large") {
        toast.push({
          tone: "error",
          title: "File too large",
          description: `"${r.file.name}" is ${bucketBytes(r.file.size)}. Limit is ${maxFileSizeMB}MB.`,
        });
      } else if (err === "file-invalid-type") {
        toast.push({
          tone: "error",
          title: "Unsupported file type",
          description: `"${r.file.name}" isn't one of the supported types.`,
        });
      } else {
        toast.push({
          tone: "error",
          title: "Couldn't accept that file",
          description: r.errors[0]?.code,
        });
      }
    },
    [toast, maxFileSizeMB],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: toAcceptMap(accepts),
      multiple,
      maxSize: maxBytes,
      onDrop,
      onDropRejected,
    });

  const state: "idle" | "dragging" | "invalid" = isDragReject
    ? "invalid"
    : isDragActive
      ? "dragging"
      : "idle";

  return (
    <FileUploader
      rootProps={getRootProps() as React.HTMLAttributes<HTMLDivElement>}
      inputProps={
        getInputProps() as React.InputHTMLAttributes<HTMLInputElement>
      }
      state={state}
      label={label}
      hint={hint}
      className={className}
    />
  );
}
