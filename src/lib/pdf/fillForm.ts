import type { FormValues, PdfBytes } from "./types";

/**
 * Fill AcroForm fields and optionally flatten so values lock in.
 * Unknown field names are skipped silently (often optional fields).
 */
export async function fillForm(
  file: PdfBytes,
  values: FormValues,
  opts?: { flatten?: boolean },
): Promise<PdfBytes> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const form = doc.getForm();

  for (const [name, value] of Object.entries(values)) {
    try {
      if (typeof value === "boolean") {
        const cb = form.getCheckBox(name);
        if (value) cb.check();
        else cb.uncheck();
      } else if (Array.isArray(value)) {
        // multi-select dropdown
        const dd = form.getDropdown(name);
        dd.select(value);
      } else {
        // try text field; fall back to dropdown single-select
        try {
          form.getTextField(name).setText(value);
        } catch {
          form.getDropdown(name).select(value);
        }
      }
    } catch {
      // unknown field — skip
    }
  }

  if (opts?.flatten) form.flatten();
  return doc.save();
}
