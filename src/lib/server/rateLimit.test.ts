import { afterEach, describe, expect, it } from "vitest";
import { rateLimit, RATE_LIMIT_CONFIG, _resetRateLimit } from "./rateLimit";

afterEach(() => _resetRateLimit());

describe("rateLimit", () => {
  it("allows the first N requests in a window and blocks the (N+1)th", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < RATE_LIMIT_CONFIG.maxPerWindow; i++) {
      const r = rateLimit(ip);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(RATE_LIMIT_CONFIG.maxPerWindow - 1 - i);
    }
    const over = rateLimit(ip);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("is per-IP", () => {
    const a = rateLimit("a.b.c.d");
    const b = rateLimit("e.f.g.h");
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(a.remaining).toBe(RATE_LIMIT_CONFIG.maxPerWindow - 1);
    expect(b.remaining).toBe(RATE_LIMIT_CONFIG.maxPerWindow - 1);
  });

  it("returns a future resetAt timestamp", () => {
    const before = Date.now();
    const r = rateLimit("9.9.9.9");
    expect(r.resetAt).toBeGreaterThanOrEqual(
      before + RATE_LIMIT_CONFIG.windowMs - 10,
    );
  });
});
