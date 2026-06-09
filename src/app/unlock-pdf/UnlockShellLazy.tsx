"use client";

import nextDynamic from "next/dynamic";

export const UnlockShellLazy = nextDynamic(
  () => import("./UnlockShell").then((m) => ({ default: m.UnlockShell })),
  { ssr: false },
);
