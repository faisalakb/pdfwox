#!/usr/bin/env node
/**
 * Generate deterministic test fixtures.
 *
 *   pnpm fixtures:gen
 *
 * Outputs to test-assets/. Re-run any time pdf-lib is upgraded.
 */
import { PDFDocument } from "pdf-lib";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../test-assets");

async function makePdf(pageCount) {
  const doc = await PDFDocument.create();
  doc.setTitle(`fixture-${pageCount}-pages`);
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));
  for (let i = 0; i < pageCount; i++) doc.addPage([400, 400]);
  return doc.save();
}

async function makeFormPdf() {
  const doc = await PDFDocument.create();
  doc.setTitle("fixture-form");
  doc.setCreationDate(new Date(0));
  doc.setModificationDate(new Date(0));
  const page = doc.addPage([400, 400]);
  const form = doc.getForm();
  const name = form.createTextField("name");
  name.setText("");
  name.addToPage(page, { x: 40, y: 320, width: 200, height: 24 });
  const subscribe = form.createCheckBox("subscribe");
  subscribe.addToPage(page, { x: 40, y: 280, width: 16, height: 16 });
  return doc.save();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, "two-page.pdf"), await makePdf(2));
  await writeFile(path.join(OUT, "three-page.pdf"), await makePdf(3));
  await writeFile(path.join(OUT, "form.pdf"), await makeFormPdf());

  // 1x1 PNG (red pixel) — minimal valid PNG.
  const onePxPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  await writeFile(path.join(OUT, "1x1.png"), onePxPng);

  // 1x1 JPEG (white).
  const onePxJpg = Buffer.from(
    "/9j/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AB//Z",
    "base64",
  );
  await writeFile(path.join(OUT, "1x1.jpg"), onePxJpg);

  console.log("fixtures: wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
