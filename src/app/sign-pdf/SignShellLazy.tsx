"use client";

import nextDynamic from "next/dynamic";

export const SignShellLazy = nextDynamic(
  () => import("./SignShell").then((m) => ({ default: m.SignShell })),
  { ssr: false },
);
