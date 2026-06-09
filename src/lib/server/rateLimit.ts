/**
 * In-memory IP rate limit. Survives within a single Node process; resets
 * on serverless cold start. Good enough for the v1 server tier; swap to
 * Upstash/KV when traffic warrants it.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(ip, fresh);
    return {
      allowed: true,
      remaining: MAX_PER_WINDOW - 1,
      resetAt: fresh.resetAt,
    };
  }
  if (existing.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_PER_WINDOW - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Test-only: clear all buckets between integration test runs. */
export function _resetRateLimit(): void {
  buckets.clear();
}

export const RATE_LIMIT_CONFIG = {
  windowMs: WINDOW_MS,
  maxPerWindow: MAX_PER_WINDOW,
} as const;
