/**
 * Analytics event taxonomy. Defined now, no-op now.
 * Real provider (Plausible or Cloudflare Web Analytics) wired Week 5
 * per spec Appendix D.
 *
 * The contract here is the product-health metric. Don't add events
 * casually — every event should answer a known question.
 */

export type AnalyticsEvent =
  | { type: "tool_viewed"; tool: string }
  | {
      type: "file_added";
      tool: string;
      fileType: string;
      sizeBucket: string;
    }
  | { type: "tool_started"; tool: string }
  | { type: "tool_succeeded"; tool: string; durationMs: number }
  | {
      type: "tool_failed";
      tool: string;
      fileType: string;
      browser: string;
      sizeBucket: string;
      reason: string;
    }
  | { type: "download_clicked"; tool: string };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") {
    // Visible in dev for verification; replaced with real provider Week 5.
    console.debug("[analytics]", event);
  }
  // Provider hook lands Week 5. Until then, this is the canonical surface.
}

export function bucketBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return "<1MB";
  if (mb < 5) return "1-5MB";
  if (mb < 25) return "5-25MB";
  if (mb < 50) return "25-50MB";
  return ">50MB";
}

interface UADataBrand {
  brand: string;
  version: string;
}
interface NavigatorUAData {
  brands: UADataBrand[];
  mobile: boolean;
}

export function detectBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
  if (nav.userAgentData?.brands?.length) {
    const skip = new Set([
      "Chromium",
      "Not?A_Brand",
      "Not.A/Brand",
      "Not_A Brand",
    ]);
    const real = nav.userAgentData.brands.find((b) => !skip.has(b.brand));
    if (real) return real.brand;
  }
  const ua = navigator.userAgent;
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "unknown";
}
