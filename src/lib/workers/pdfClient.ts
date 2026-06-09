import * as Comlink from "comlink";
import type { Remote } from "comlink";
import type {
  FormValues,
  ImageItem,
  ImagesToPdfOptions,
  PdfBytes,
  ProtectOptions,
} from "@/lib/pdf/types";
import type { InspectedField } from "@/lib/pdf/inspect";
import type { NewFieldSpec } from "@/lib/pdf/addFields";
import type { PageReplacement } from "@/lib/pdf/replacePages";
import type { AnnotationSpec } from "@/lib/pdf/drawAnnotations";
import type { AddWatermarkSpec } from "@/lib/pdf/addWatermark";
import type {
  CoverRect,
  CoverWatermarksOptions,
} from "@/lib/pdf/coverWatermarks";
import type { SignaturePlacement } from "@/lib/pdf/placeSignature";

/**
 * Main-thread Comlink wrapper. Lazy singleton — the Worker (and pdf-lib
 * inside it) is created on first call. Tool pages keep the homepage chunk
 * free of pdf-lib by importing this module only inside event handlers.
 */
export interface PdfApi {
  merge(files: PdfBytes[], onProgress?: (p: number) => void): Promise<PdfBytes>;
  imagesToPdf(items: ImageItem[], opts: ImagesToPdfOptions): Promise<PdfBytes>;
  unlock(file: PdfBytes, password: string): Promise<PdfBytes>;
  protect(file: PdfBytes, opts: ProtectOptions): Promise<PdfBytes>;
  fillForm(
    file: PdfBytes,
    values: FormValues,
    opts?: { flatten?: boolean },
  ): Promise<PdfBytes>;
  inspectForm(file: PdfBytes): Promise<InspectedField[]>;
  addFields(file: PdfBytes, fields: NewFieldSpec[]): Promise<PdfBytes>;
  replacePages(
    file: PdfBytes,
    replacements: PageReplacement[],
  ): Promise<PdfBytes>;
  drawAnnotations(file: PdfBytes, items: AnnotationSpec[]): Promise<PdfBytes>;
  addWatermark(file: PdfBytes, spec: AddWatermarkSpec): Promise<PdfBytes>;
  coverWatermarks(
    file: PdfBytes,
    rects: CoverRect[],
    opts?: CoverWatermarksOptions,
  ): Promise<PdfBytes>;
  placeSignature(
    file: PdfBytes,
    placements: SignaturePlacement[],
  ): Promise<PdfBytes>;
}

let cached: Remote<PdfApi> | null = null;
let worker: Worker | null = null;

export async function getPdfApi(): Promise<Remote<PdfApi>> {
  if (cached) return cached;
  worker = new Worker(new URL("./pdf.worker.ts", import.meta.url), {
    type: "module",
  });
  cached = Comlink.wrap<PdfApi>(worker);
  return cached;
}

/** Terminate the worker. Useful for tests and reset paths. */
export function terminatePdfApi(): void {
  worker?.terminate();
  worker = null;
  cached = null;
}

/** Wrap an onProgress callback so it can cross the worker boundary. */
export function proxyProgress(
  onProgress: (p: number) => void,
): (p: number) => void {
  return Comlink.proxy(onProgress);
}
