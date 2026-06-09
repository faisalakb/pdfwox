"use client";

import nextDynamic from "next/dynamic";
import type { ImagesToPdfShellProps } from "./ImagesToPdfShell";

export const ImagesToPdfShellLazy = nextDynamic<ImagesToPdfShellProps>(
  () =>
    import("./ImagesToPdfShell").then((m) => ({
      default: m.ImagesToPdfShell,
    })),
  { ssr: false },
);
