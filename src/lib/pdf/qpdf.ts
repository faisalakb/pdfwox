"use client";

/**
 * Main-thread qpdf-wasm wrapper.
 *
 * Why main-thread, not worker: the wasm comes with an Emscripten module
 * factory that prefers DOM-style fetch + Module.locateFile. Wiring it into
 * our existing Comlink worker would require shipping the loader into the
 * worker bundle and handling the wasm-fetch separately. v1 ships these
 * two ops (protect / unlock) on the main thread; typical PDFs of 1–50 MB
 * finish in 100–500 ms. Worker-side qpdf can land later if real-world
 * sizes warrant it.
 */
import createModule, {
  type QpdfInstance,
} from "@neslinesli93/qpdf-wasm";

const WASM_URL = "/qpdf.wasm";

let cached: Promise<QpdfInstance> | null = null;

function getQpdf(): Promise<QpdfInstance> {
  if (cached) return cached;
  cached = createModule({ locateFile: () => WASM_URL });
  return cached;
}

const INPUT = "/in.pdf";
const OUTPUT = "/out.pdf";

async function runQpdf(
  inputBytes: Uint8Array,
  args: (instance: QpdfInstance) => string[],
): Promise<Uint8Array> {
  const qpdf = await getQpdf();
  qpdf.FS.writeFile(INPUT, inputBytes);
  try {
    const code = qpdf.callMain(args(qpdf));
    if (code !== 0 && code !== 3) {
      // 0 = success, 3 = warnings (still produced output)
      throw new Error(`qpdf exited with code ${code}`);
    }
    return qpdf.FS.readFile(OUTPUT);
  } catch (e) {
    // qpdf throws when input password is wrong, file is corrupt, etc.
    if (e instanceof Error) throw e;
    throw new Error(String(e));
  }
}

export interface QpdfProtectOptions {
  userPassword: string;
  ownerPassword?: string;
  permissions?: {
    print?: boolean; // default true
    modify?: boolean; // default true
    extract?: boolean; // default true
    annotate?: boolean; // default true
  };
}

export async function qpdfProtect(
  bytes: Uint8Array,
  opts: QpdfProtectOptions,
): Promise<Uint8Array> {
  if (!opts.userPassword) throw new Error("qpdfProtect: user password required");
  const owner = opts.ownerPassword || opts.userPassword;
  const perms = opts.permissions ?? {};

  const flags: string[] = [];
  if (perms.print === false) flags.push("--print=none");
  if (perms.modify === false) flags.push("--modify=none");
  if (perms.extract === false) flags.push("--extract=n");
  if (perms.annotate === false) flags.push("--annotate=n");

  return runQpdf(bytes, () => [
    INPUT,
    "--encrypt",
    opts.userPassword,
    owner,
    "256",
    ...flags,
    "--",
    OUTPUT,
  ]);
}

export async function qpdfUnlock(
  bytes: Uint8Array,
  password: string,
): Promise<Uint8Array> {
  return runQpdf(bytes, () => [
    `--password=${password}`,
    "--decrypt",
    INPUT,
    OUTPUT,
  ]);
}

/** Best-effort detection of password-protected PDFs (no decryption). */
export function looksEncrypted(bytes: Uint8Array): boolean {
  // /Encrypt entry in the trailer / catalog is the canonical marker.
  // Search the first ~64 KB; PDF dictionary structure puts trailer near the end too,
  // so also scan the last 4 KB.
  const head = bytes.subarray(0, Math.min(bytes.length, 65536));
  const tail = bytes.subarray(Math.max(0, bytes.length - 4096));
  const needle = new TextEncoder().encode("/Encrypt");
  return contains(head, needle) || contains(tail, needle);
}

function contains(hay: Uint8Array, needle: Uint8Array): boolean {
  outer: for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}
