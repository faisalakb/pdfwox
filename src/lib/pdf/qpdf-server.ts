"use server";

/**
 * Server-only qpdf-wasm operations.
 * These run only on the server and never get included in the browser bundle.
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
