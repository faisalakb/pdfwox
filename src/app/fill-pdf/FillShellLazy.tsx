"use client";

import nextDynamic from "next/dynamic";

export const FillShellLazy = nextDynamic(
  () => import("./FillShell").then((m) => ({ default: m.FillShell })),
  { ssr: false },
);
