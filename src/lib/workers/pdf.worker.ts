/// <reference lib="webworker" />
import * as Comlink from "comlink";

import { merge } from "@/lib/pdf/merge";
import { imagesToPdf } from "@/lib/pdf/imagesToPdf";
import { unlock } from "@/lib/pdf/unlock";
import { protect } from "@/lib/pdf/protect";
import { fillForm } from "@/lib/pdf/fillForm";
import { inspectForm } from "@/lib/pdf/inspect";
import { addFields } from "@/lib/pdf/addFields";
import { replacePages } from "@/lib/pdf/replacePages";
import { drawAnnotations } from "@/lib/pdf/drawAnnotations";
import { addWatermark } from "@/lib/pdf/addWatermark";
import { coverWatermarks } from "@/lib/pdf/coverWatermarks";
import { placeSignature } from "@/lib/pdf/placeSignature";

const api = {
  merge,
  imagesToPdf,
  unlock,
  protect,
  fillForm,
  inspectForm,
  addFields,
  replacePages,
  drawAnnotations,
  addWatermark,
  coverWatermarks,
  placeSignature,
};

export type PdfWorkerApi = typeof api;

Comlink.expose(api);
