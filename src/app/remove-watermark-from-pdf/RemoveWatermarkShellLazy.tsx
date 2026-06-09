"use client";

import nextDynamic from "next/dynamic";

export const RemoveWatermarkShellLazy = nextDynamic(
  () =>
    import("./RemoveWatermarkShell").then((m) => ({
      default: m.RemoveWatermarkShell,
    })),
  { ssr: false },
);
