import type { PdfBytes } from "./types";

export type FormFieldType =
  | "text"
  | "checkbox"
  | "dropdown"
  | "radio"
  | "optionlist"
  | "signature"
  | "button"
  | "unknown";

export interface InspectedField {
  name: string;
  type: FormFieldType;
  /** For text fields: current text. For checkboxes: "Yes"/"Off". */
  value?: string | string[] | boolean;
  /** For dropdowns/radios. */
  options?: string[];
  /** Whether the source PDF marks this field as required. */
  required?: boolean;
  /** 0-indexed page each widget lives on. May be empty if unanchored. */
  pages: number[];
}

/**
 * Read AcroForm fields from a PDF. Returns a minimal, serializable summary
 * so it can cross the Comlink worker boundary safely.
 */
export async function inspectForm(file: PdfBytes): Promise<InspectedField[]> {
  const {
    PDFDocument,
    PDFTextField,
    PDFCheckBox,
    PDFDropdown,
    PDFRadioGroup,
    PDFOptionList,
    PDFSignature,
    PDFButton,
  } = await import("pdf-lib");

  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();

  const pageRefs = doc.getPages().map((p) => p.ref);
  const out: InspectedField[] = [];

  for (const f of fields) {
    const name = f.getName();
    let type: FormFieldType = "unknown";
    let value: InspectedField["value"];
    let options: string[] | undefined;

    if (f instanceof PDFTextField) {
      type = "text";
      value = f.getText() ?? "";
    } else if (f instanceof PDFCheckBox) {
      type = "checkbox";
      value = f.isChecked();
    } else if (f instanceof PDFDropdown) {
      type = "dropdown";
      options = f.getOptions();
      value = f.getSelected();
    } else if (f instanceof PDFRadioGroup) {
      type = "radio";
      options = f.getOptions();
      value = f.getSelected() ?? "";
    } else if (f instanceof PDFOptionList) {
      type = "optionlist";
      options = f.getOptions();
      value = f.getSelected();
    } else if (f instanceof PDFSignature) {
      type = "signature";
    } else if (f instanceof PDFButton) {
      type = "button";
    }

    // Map widgets → page indices.
    const pages: number[] = [];
    try {
      const widgets = f.acroField.getWidgets();
      for (const w of widgets) {
        const pageRef = w.P();
        if (!pageRef) continue;
        const idx = pageRefs.findIndex((r) => r === pageRef);
        if (idx >= 0 && !pages.includes(idx)) pages.push(idx);
      }
    } catch {
      // Some PDFs have widgets without a /P key; we skip page mapping silently.
    }

    out.push({ name, type, value, options, pages });
  }

  return out;
}
