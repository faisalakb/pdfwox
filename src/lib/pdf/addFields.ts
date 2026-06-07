import type { PdfBytes } from "./types";

export type NewFieldType = "text" | "checkbox" | "signature";

export interface NewFieldSpec {
  name: string;
  type: NewFieldType;
  /** 0-indexed page the field belongs to. */
  page: number;
  /** Rectangle in PDF user-space coordinates (origin bottom-left). */
  rect: { x: number; y: number; width: number; height: number };
  /** Optional: default text value (text fields only). */
  defaultValue?: string;
  /** Optional: required flag. */
  required?: boolean;
}

/**
 * Append new AcroForm fields to a PDF and return the saved bytes.
 *
 * Coordinates are in PDF user space (1 pt = 1/72 inch, origin bottom-left).
 * Callers that have screen-space coordinates from a pdf.js canvas must
 * convert first (see /create-fillable-pdf shell).
 */
export async function addFields(
  file: PdfBytes,
  fields: NewFieldSpec[],
): Promise<PdfBytes> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const form = doc.getForm();
  const pages = doc.getPages();

  for (const spec of fields) {
    const page = pages[spec.page];
    if (!page) throw new Error(`addFields: page ${spec.page} out of range`);

    if (spec.type === "text") {
      const field = form.createTextField(spec.name);
      if (spec.defaultValue) field.setText(spec.defaultValue);
      if (spec.required) field.enableRequired();
      field.addToPage(page, spec.rect);
    } else if (spec.type === "checkbox") {
      const field = form.createCheckBox(spec.name);
      if (spec.required) field.enableRequired();
      field.addToPage(page, spec.rect);
    } else if (spec.type === "signature") {
      // pdf-lib doesn't expose a signature-field creator. Approximate as
      // a labelled text field — the visual rectangle is still placed and
      // works for "draw here, then flatten" flows. A true /Sig field
      // arrives when we ship cryptographic signing (Week 8+).
      const field = form.createTextField(spec.name);
      field.setText("Signature");
      field.addToPage(page, spec.rect);
    }
  }

  return doc.save();
}
