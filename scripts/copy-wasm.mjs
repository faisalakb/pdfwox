#!/usr/bin/env node
/**
 * Copy bundled wasm assets out of node_modules into public/ so they can
 * be fetched at runtime. Run via postinstall and on demand via
 * `pnpm wasm:copy`.
 *
 * Currently mirrors `@neslinesli93/qpdf-wasm/dist/qpdf.wasm` — used by
 * /protect-pdf and /unlock-pdf via `src/lib/pdf/qpdf.ts`.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const QPDF_DIST = path.join(
  ROOT,
  "node_modules",
  "@neslinesli93",
  "qpdf-wasm",
  "dist",
);

const ENTRIES = [
  {
    from: path.join(QPDF_DIST, "qpdf.wasm"),
    to: path.join(ROOT, "public", "qpdf.wasm"),
  },
  {
    from: path.join(QPDF_DIST, "qpdf.js"),
    to: path.join(ROOT, "public", "qpdf.js"),
  },
];

async function main() {
  await mkdir(path.join(ROOT, "public"), { recursive: true });
  for (const e of ENTRIES) {
    if (!existsSync(e.from)) {
      console.warn(`copy-wasm: source missing, skipping: ${e.from}`);
      continue;
    }
    await copyFile(e.from, e.to);
    console.log(`copy-wasm: ${path.relative(ROOT, e.to)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
