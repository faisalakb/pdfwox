"use client";

import nextDynamic from "next/dynamic";

export const RedactShellLazy = nextDynamic(
  () => import("./RedactShell").then((m) => ({ default: m.RedactShell })),
  { ssr: false },
);
