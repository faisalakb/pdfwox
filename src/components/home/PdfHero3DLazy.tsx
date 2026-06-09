"use client";

import nextDynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { PdfHero3D as T } from "./PdfHero3D";

export const PdfHero3DLazy = nextDynamic<ComponentProps<typeof T>>(
  () => import("./PdfHero3D").then((m) => ({ default: m.PdfHero3D })),
  { ssr: false },
);
