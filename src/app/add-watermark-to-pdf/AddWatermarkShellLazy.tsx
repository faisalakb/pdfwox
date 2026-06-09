"use client";

import nextDynamic from "next/dynamic";

export const AddWatermarkShellLazy = nextDynamic(
  () =>
    import("./AddWatermarkShell").then((m) => ({
      default: m.AddWatermarkShell,
    })),
  { ssr: false },
);
