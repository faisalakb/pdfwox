"use client";

import { useEffect } from "react";
import { warmPdfWorker } from "@/lib/workers/pdfClient";

/** Invisible component — spawns the PDF worker in the background.
 *  Delayed until the browser is idle so qpdf.wasm download doesn't
 *  compete with LCP-critical resources (fonts, JS chunks). */
export function WorkerPrewarm() {
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => warmPdfWorker(), { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(warmPdfWorker, 2000);
    return () => clearTimeout(id);
  }, []);
  return null;
}
