# Dashboards & Monitoring

Four dashboards cover the four things that matter at this stage: product health,
errors, performance, and search. Below is where each lives, what "healthy" looks
like, and the signal that should trigger investigation.

---

## 1. Product Health — per-tool funnel (Analytics)

**Tool:** Your analytics platform (e.g. Plausible, PostHog, or the custom
`track()` calls in `src/lib/analytics.ts`).

**What it shows:** The funnel for each tool:

```
tool_viewed → file_added → tool_started → tool_succeeded | tool_failed
```

**Key metric:** Success rate per tool = `tool_succeeded / tool_started`

**Where to find it:**
- Create a "Funnels" view filtered by `toolSlug` property.
- Group by `tool` dimension to get per-tool breakdown.
- The `track()` calls already emit `toolSlug`, `fileType`, `fileSizeBucket`,
  and `browser` properties — use them for filtering.

**Healthy:** Success rate ≥ 95% on each tool.

**Investigate when:**
- Any tool drops below 95% success rate.
- `tool_failed` events spike on a specific `fileType` (e.g., `application/pdf`
  with a specific file structure, or `image/heic` on non-WebKit browsers).
- `file_added` is high but `tool_started` is low — indicates the UI isn't
  prompting action clearly enough.

---

## 2. Errors — grouped by tool × browser × file type (Sentry)

**Tool:** Sentry (configured in `src/lib/analytics.ts` and
`scripts/sentry-smoke.mjs`).

**What it shows:** Runtime errors grouped by:
- `toolSlug` (tag)
- `browser` (context)
- `fileType` (breadcrumb)

**Where to find it:**
- Sentry → Issues → filter by tag `tool:*`
- Create a saved search: `is:unresolved has:tool`
- Use the "Group by" → `tags[tool]` view to see the issue count per tool.

**Key issue classes to watch:**
- `WebAssembly.instantiate` failures → usually a CORS or MIME-type issue with
  `.wasm` file delivery.
- Worker message timeouts → file too large for device RAM, or WASM OOM.
- `heic2any` errors on Firefox/Chrome → HEIC support is Safari-only without
  the library; verify the library is loading.
- `qpdf-wasm` errors on mobile → device memory pressure.

**Healthy:** Zero new unresolved issues in the past 7 days.

**Investigate when:**
- Any new Sentry issue has ≥ 3 events in 24 hours.
- An issue correlates strongly with one browser (e.g., only Firefox) —
  likely a WASM or Worker API compatibility issue.
- An issue correlates strongly with one file type — likely a codec or
  parser edge case.

---

## 3. Performance — Core Web Vitals field data

**Tool:** Google Search Console → Core Web Vitals report (after the site has
real traffic); Chrome UX Report (CrUX) for aggregate data.

**What it shows:**
- LCP (Largest Contentful Paint): should be < 2.5 s (good range)
- CLS (Cumulative Layout Shift): should be < 0.1 (good range)
- INP (Interaction to Next Paint): should be < 200 ms (good range)

**Where to find it:**
- GSC → Core Web Vitals → "Good URLs" vs. "Needs improvement"
- CrUX dashboard: `https://crux.run/` (public, no login)
- Lighthouse CI results in `scripts/lighthouse.mjs`

**Healthy:** All three metrics in the "Good" band for both mobile and desktop.

**Investigate when:**
- LCP > 2.5 s: check if a heavy shell component is blocking the initial render.
  Verify `nextDynamic` import is working (Network tab should show the shell
  chunk loading after the initial HTML).
- CLS > 0.1: a new component is adding un-reserved space. Run Lighthouse and
  check the CLS debug view for the offending element.
- INP > 200 ms: a main-thread task is blocking. Profile with Chrome DevTools
  Performance panel; look for long tasks during the first file drop interaction.

---

## 4. Search — GSC impressions, clicks, and CTR

**Tool:** Google Search Console (after domain verification and sitemap submission).

**What it shows:**
- Top pages by impressions and clicks
- Queries triggering each page
- Pages with high impressions but low CTR (title/description issue)
- Pages gaining impressions over time (content expansion opportunity)

**Where to find it:**
- GSC → Performance → Search results
- Filter by page to drill into a specific tool or guide
- Sort by "Impressions" descending to find the highest-visibility pages

**Healthy:** CTR ≥ 3% on tool pages, ≥ 5% on guide pages (these are rough
baselines for informational content; adjust once you have real data).

**Investigate when:**
- A page has ≥ 500 impressions/month but < 2% CTR: the title or description
  is not compelling. Check if the primary keyword appears in the first 3 words
  of the title. Consider adding a differentiator ("No upload", "Free", "Instant").
- A guide is gaining impressions but has no FAQ section: add 4–6 FAQ answers
  matching the actual search queries shown in GSC for that page.
- A query you're not targeting shows up with many impressions: evaluate whether
  a new guide or tool landing page is warranted.

---

## Quick reference

| Signal | Tool | Investigate threshold |
|--------|------|----------------------|
| Tool success rate | Analytics funnels | < 95% per tool |
| New errors | Sentry Issues | ≥ 3 events / 24 h |
| Core Web Vitals | GSC / CrUX | Any metric outside "Good" band |
| Search CTR | GSC Performance | < 2% with ≥ 500 impressions/mo |

---

*This document is a living reference — update it when dashboards are renamed,
when new tools are added to the funnel, or when baseline thresholds are revised
from real data.*
