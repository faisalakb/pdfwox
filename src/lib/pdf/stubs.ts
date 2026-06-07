import type { PdfBytes } from "./types";
import { NotImplementedError } from "./types";

/**
 * Typed stubs for ops landing in later waves. Keeps the worker API
 * surface stable so tool pages can wire to them without churn.
 */

export async function redact(_file: PdfBytes): Promise<PdfBytes> {
  throw new NotImplementedError("Redact PDF", "Week 6");
}

export async function annotate(_file: PdfBytes): Promise<PdfBytes> {
  throw new NotImplementedError("Annotate PDF", "Week 6");
}

export async function addWatermark(_file: PdfBytes): Promise<PdfBytes> {
  throw new NotImplementedError("Add watermark", "Week 7");
}

export async function removeWatermark(_file: PdfBytes): Promise<PdfBytes> {
  throw new NotImplementedError("Remove watermark", "Week 7");
}

export async function sign(_file: PdfBytes): Promise<PdfBytes> {
  throw new NotImplementedError("Sign PDF", "Week 8");
}

export async function pdfToText(_file: PdfBytes): Promise<string> {
  throw new NotImplementedError("PDF to Text (OCR)", "Week 9 server tier");
}

export async function ocrPdf(_file: PdfBytes): Promise<PdfBytes> {
  throw new NotImplementedError("OCR PDF", "Week 9 server tier");
}
