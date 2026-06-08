"use client";

/**
 * Main-thread qpdf-wasm wrapper.
 *
 * Why main-thread, not worker: the Emscripten loader expects DOM-style
 * fetch + Module.locateFile. Wiring it through our Comlink worker would
 * mean shipping the loader into the worker bundle and handling the
 * wasm-fetch separately. v1 ships these two ops on the main thread.
 * Typical PDFs of 1–50 MB finish in 100–500 ms.
 *
 * Why we don't `import "@neslinesli93/qpdf-wasm"`: the bundled qpdf.js
 * contains `require("fs")` / `require("path")` calls inside a dead Node
 * branch. Browser bundlers (Turbopack, webpack) statically analyze these
 * and fail to build. We sidestep the bundler by loading qpdf.js from
 * /qpdf.js (copied to public/ by scripts/copy-wasm.mjs at install time)
 * via a script tag — the browser parses it at runtime so requires never
 * run.
 */

interface QpdfFS {
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
  mkdir: (path: string) => void;
}

interface QpdfInstance {
  callMain: (args: string[]) => number;
  FS: QpdfFS;
}

type CreateModule = (opts: {
  locateFile?: () => string;
  noInitialRun?: boolean;
}) => Promise<QpdfInstance>;

declare global {
  interface Window {
    createQpdfModule?: CreateModule;
  }
}

const SCRIPT_URL = "/qpdf.js";
const WASM_URL = "/qpdf.wasm";

let scriptLoad: Promise<CreateModule> | null = null;
let instance: Promise<QpdfInstance> | null = null;

function loadScript(): Promise<CreateModule> {
  if (scriptLoad) return scriptLoad;
  scriptLoad = new Promise<CreateModule>((resolve, reject) => {
    if (window.createQpdfModule) {
      resolve(window.createQpdfModule);
      return;
    }
    const existing =
      document.querySelector<HTMLScriptElement>(`script[data-qpdf]`);
    if (existing) {
      existing.addEventListener("load", () => {
        // The UMD wrapper exposes the factory as `Module` on window.
        const factory = (window as unknown as { Module?: CreateModule }).Module;
        if (factory) resolve(factory);
        else reject(new Error("qpdf.js loaded but factory not found"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("qpdf.js failed to load")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.dataset.qpdf = "1";
    script.onload = () => {
      const w = window as unknown as { Module?: CreateModule };
      if (w.Module) resolve(w.Module);
      else reject(new Error("qpdf.js loaded but factory not found"));
    };
    script.onerror = () => reject(new Error("qpdf.js failed to load"));
    document.head.appendChild(script);
  });
  return scriptLoad;
}

async function getQpdf(): Promise<QpdfInstance> {
  if (instance) return instance;
  instance = loadScript().then((create) =>
    create({ locateFile: () => WASM_URL, noInitialRun: true }),
  );
  return instance;
}

const INPUT = "/in.pdf";
const OUTPUT = "/out.pdf";

async function runQpdf(
  inputBytes: Uint8Array,
  args: string[],
): Promise<Uint8Array> {
  const qpdf = await getQpdf();
  qpdf.FS.writeFile(INPUT, inputBytes);
  const code = qpdf.callMain(args);
  if (code !== 0 && code !== 3) {
    throw new Error(`qpdf exited with code ${code}`);
  }
  return qpdf.FS.readFile(OUTPUT);
}

export interface QpdfProtectOptions {
  userPassword: string;
  ownerPassword?: string;
  permissions?: {
    print?: boolean;
    modify?: boolean;
    extract?: boolean;
    annotate?: boolean;
  };
}

/** Pure: build a qpdf CLI argv for encrypting. Exported for unit tests. */
export function buildProtectArgs(opts: QpdfProtectOptions): string[] {
  const owner = opts.ownerPassword || opts.userPassword;
  const perms = opts.permissions ?? {};
  const flags: string[] = [];
  if (perms.print === false) flags.push("--print=none");
  if (perms.modify === false) flags.push("--modify=none");
  if (perms.extract === false) flags.push("--extract=n");
  if (perms.annotate === false) flags.push("--annotate=n");
  return [
    INPUT,
    "--encrypt",
    opts.userPassword,
    owner,
    "256",
    ...flags,
    "--",
    OUTPUT,
  ];
}

export async function qpdfProtect(
  bytes: Uint8Array,
  opts: QpdfProtectOptions,
): Promise<Uint8Array> {
  if (!opts.userPassword) {
    throw new Error("qpdfProtect: user password required");
  }
  return runQpdf(bytes, buildProtectArgs(opts));
}

/** Pure: build a qpdf CLI argv for decrypting. Exported for unit tests. */
export function buildUnlockArgs(password: string): string[] {
  return [`--password=${password}`, "--decrypt", INPUT, OUTPUT];
}

export async function qpdfUnlock(
  bytes: Uint8Array,
  password: string,
): Promise<Uint8Array> {
  return runQpdf(bytes, buildUnlockArgs(password));
}

/** Best-effort: scan for the /Encrypt marker without decrypting. */
export function looksEncrypted(bytes: Uint8Array): boolean {
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
