/**
 * Server-side OCR endpoint.
 *
 * Receives a PDF as multipart/form-data, runs it through a cloud OCR
 * provider, and returns either extracted text (mode=text) or a searchable
 * sandwich PDF (mode=ocr). The file is held only in process memory for
 * the duration of the call — there is no on-disk write, so "delete"
 * happens automatically when the function returns.
 *
 * v1 ships **failing closed** unless a provider is configured via env:
 *
 *   GCP_VISION_KEY  → Google Vision API JSON service-account credentials
 *   AWS_REGION + AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY → Textract
 *
 * If neither is configured the endpoint returns 503 so the client falls
 * back to its in-browser Tesseract.js path. That's the deliberate
 * default — see Week 9 of the build spec.
 */
import { NextResponse } from "next/server";
import { rateLimit, RATE_LIMIT_CONFIG } from "@/lib/server/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIMES = new Set(["application/pdf"]);

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function provider():
  | { kind: "gcp"; key: string }
  | { kind: "aws"; region: string; access: string; secret: string }
  | null {
  if (process.env.GCP_VISION_KEY) {
    return { kind: "gcp", key: process.env.GCP_VISION_KEY };
  }
  if (
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  ) {
    return {
      kind: "aws",
      region: process.env.AWS_REGION,
      access: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  return null;
}

interface OcrResult {
  text: string;
  // PDF bytes will be added when sandwich mode is wired to a provider.
}

async function runCloudOcr(
  _bytes: Uint8Array,
  _provider: NonNullable<ReturnType<typeof provider>>,
): Promise<OcrResult> {
  // Stub: cloud provider integration is intentionally left unimplemented
  // in v1. The route fails closed (503) until you ship the integration
  // and re-deploy. The point of having the route now is to lock down the
  // contract — validation, rate limit, deletion — so the integration is
  // additive when it lands.
  throw new Error("CloudOcrNotConfigured");
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: `Try again in ${Math.ceil((rl.resetAt - Date.now()) / 1000)}s.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxPerWindow),
          "X-RateLimit-Remaining": "0",
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "bad_request", message: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  // Cheap size cap before we parse anything large.
  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BYTES + 1024) {
    return NextResponse.json(
      {
        error: "too_large",
        message: `Max ${Math.round(MAX_BYTES / 1024 / 1024)} MB.`,
      },
      { status: 413 },
    );
  }

  const prov = provider();
  if (!prov) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Server-side OCR is not configured on this instance. Use the in-browser fallback.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Malformed multipart payload." },
      { status: 400 },
    );
  }
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: "missing_file", message: "No 'file' field in form." },
      { status: 400 },
    );
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return NextResponse.json(
      {
        error: "unsupported_type",
        message: `Got ${file.type || "unknown"}; expected application/pdf.`,
      },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        error: "too_large",
        message: `Max ${Math.round(MAX_BYTES / 1024 / 1024)} MB; received ${Math.round(
          file.size / 1024 / 1024,
        )} MB.`,
      },
      { status: 413 },
    );
  }

  const mode = form.get("mode")?.toString() ?? "text";
  if (mode !== "text" && mode !== "ocr") {
    return NextResponse.json(
      { error: "bad_request", message: `Unknown mode "${mode}".` },
      { status: 400 },
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await runCloudOcr(bytes, prov);

    // Bytes go out of scope here. Node GC eventually reclaims them; in
    // practice that's the "delete" we promised. No on-disk write means
    // no on-disk leak.

    return NextResponse.json(
      {
        text: result.text,
        provider: prov.kind,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Limit": String(RATE_LIMIT_CONFIG.maxPerWindow),
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "CloudOcrNotConfigured") {
      return NextResponse.json(
        {
          error: "not_configured",
          message:
            "Server-side OCR provider stub. Use the in-browser fallback.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "internal", message: "OCR failed." },
      { status: 500 },
    );
  }
}
