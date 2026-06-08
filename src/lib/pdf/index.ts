export * from "./types";
export { merge } from "./merge";
export { imagesToPdf } from "./imagesToPdf";
export { unlock } from "./unlock";
export { protect } from "./protect";
export { fillForm } from "./fillForm";
export {
  inspectForm,
  type InspectedField,
  type FormFieldType,
} from "./inspect";
export { addFields, type NewFieldSpec, type NewFieldType } from "./addFields";
export { replacePages, type PageReplacement } from "./replacePages";
export {
  drawAnnotations,
  type AnnotationSpec,
  type PdfRect,
} from "./drawAnnotations";
export {
  addWatermark,
  type AddWatermarkSpec,
  type TextWatermark,
  type ImageWatermark,
  type WatermarkPosition,
} from "./addWatermark";
export {
  coverWatermarks,
  type CoverRect,
  type CoverWatermarksOptions,
} from "./coverWatermarks";
export {
  redact,
  annotate,
  addWatermark,
  removeWatermark,
  sign,
  pdfToText,
  ocrPdf,
} from "./stubs";
