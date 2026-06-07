import type { PdfBytes, ProtectOptions } from "./types";
import { NotImplementedError } from "./types";

/**
 * Add a password to a PDF.
 *
 * Week 2: stubbed. pdf-lib does not implement AES-256 encryption.
 * Plan: add qpdf-wasm (~1.5MB) in Week 3; lazy-load only on this tool's
 * page so other tools stay slim.
 */
export async function protect(
  _file: PdfBytes,
  _opts: ProtectOptions,
): Promise<PdfBytes> {
  throw new NotImplementedError(
    "PDF protection (AES-256)",
    "lands Week 3 with qpdf-wasm",
  );
}
