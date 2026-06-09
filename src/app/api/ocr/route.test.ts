// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "./route";
import { _resetRateLimit } from "@/lib/server/rateLimit";

beforeEach(() => {
  _resetRateLimit();
  // Force the "not configured" path on by default.
  delete process.env.GCP_VISION_KEY;
  delete process.env.AWS_REGION;
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
});

afterEach(() => _resetRateLimit());

function multipart(file: Blob, mode = "text"): Request {
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);
  return new Request("http://test.local/api/ocr", {
    method: "POST",
    body: form,
    headers: {
      "x-forwarded-for": "203.0.113.5",
    },
  });
}

const TINY_PDF = new Blob([new TextEncoder().encode("%PDF-1.7\n%%EOF")], {
  type: "application/pdf",
});
const WRONG_MIME = new Blob([new TextEncoder().encode("hello")], {
  type: "text/plain",
});
const OVERSIZED = new Blob([new Uint8Array(51 * 1024 * 1024)], {
  type: "application/pdf",
});

describe("POST /api/ocr", () => {
  it("returns 503 when no cloud provider is configured", async () => {
    const res = await POST(multipart(TINY_PDF));
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("not_configured");
  });

  it("returns 415 on disallowed MIME (with provider configured)", async () => {
    process.env.GCP_VISION_KEY = "x";
    const res = await POST(multipart(WRONG_MIME));
    expect(res.status).toBe(415);
  });

  it("returns 413 on oversized payload (with provider configured)", async () => {
    process.env.GCP_VISION_KEY = "x";
    const res = await POST(multipart(OVERSIZED));
    expect(res.status).toBe(413);
  });

  it("returns 400 when 'mode' is not 'text' or 'ocr'", async () => {
    process.env.GCP_VISION_KEY = "x";
    const res = await POST(multipart(TINY_PDF, "weird"));
    expect(res.status).toBe(400);
  });

  it("returns 400 without multipart content-type", async () => {
    const req = new Request("http://test.local/api/ocr", {
      method: "POST",
      body: "raw",
      headers: { "content-type": "text/plain", "x-forwarded-for": "9.9.9.9" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rate-limits per IP after the configured max", async () => {
    process.env.GCP_VISION_KEY = "x";
    // 6 calls should succeed-ish (200 will fail with stub, but past rate limit).
    // Past 6, we get 429.
    for (let i = 0; i < 6; i++) {
      const res = await POST(multipart(TINY_PDF));
      expect(res.status).not.toBe(429);
    }
    const limited = await POST(multipart(TINY_PDF));
    expect(limited.status).toBe(429);
    const body = (await limited.json()) as { error: string };
    expect(body.error).toBe("rate_limited");
  });
});
