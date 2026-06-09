"use client";

import { useEffect } from "react";
import { warmPdfWorker } from "@/lib/workers/pdfClient";

/** Invisible component — spawns the PDF worker in the background on mount
 *  so it's ready before the user drops a file. */
export function WorkerPrewarm() {
  useEffect(() => {
    warmPdfWorker();
  }, []);
  return null;
}
