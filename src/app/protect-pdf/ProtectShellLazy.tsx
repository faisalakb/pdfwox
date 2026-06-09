"use client";

import nextDynamic from "next/dynamic";

export const ProtectShellLazy = nextDynamic(
  () => import("./ProtectShell").then((m) => ({ default: m.ProtectShell })),
  { ssr: false },
);
