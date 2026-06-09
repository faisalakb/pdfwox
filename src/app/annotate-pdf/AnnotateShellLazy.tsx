"use client";

import nextDynamic from "next/dynamic";

export const AnnotateShellLazy = nextDynamic(
  () => import("./AnnotateShell").then((m) => ({ default: m.AnnotateShell })),
  { ssr: false },
);
