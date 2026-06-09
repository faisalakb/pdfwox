"use client";

import nextDynamic from "next/dynamic";

export const OcrPdfShellLazy = nextDynamic(
  () => import("./OcrPdfShell").then((m) => ({ default: m.OcrPdfShell })),
  { ssr: false },
);
