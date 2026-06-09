"use client";

import nextDynamic from "next/dynamic";

export const CreateShellLazy = nextDynamic(
  () => import("./CreateShell").then((m) => ({ default: m.CreateShell })),
  { ssr: false },
);
