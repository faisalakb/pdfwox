"use client";

import nextDynamic from "next/dynamic";

export const PdfToTextShellLazy = nextDynamic(
  () =>
    import("./PdfToTextShell").then((m) => ({ default: m.PdfToTextShell })),
  { ssr: false },
);
