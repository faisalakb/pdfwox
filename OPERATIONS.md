# Operations playbook

This document is for the operator — the person responsible for keeping the
site healthy after the initial build. It covers what to do monthly, quarterly,
and when to change strategy.

**The honest baseline:** The build is the foundation. Rankings come from
authority (the number and quality of sites that link to you), which is the
operator's job. That process takes 6–12 months from launch and no agent can
do it for you. Do not measure SEO success before month 4.

---

## Monthly tasks (~2 hours)

### 1. Review Google Search Console

Log into GSC (Search results → Performance) and run through:

**Impressions-gaining pages (content expansion):**
- Sort by "Impressions" descending. Which pages grew this month?
- For each page gaining impressions, look at the queries column. Are there
  long-tail variants you're not covering?
- If a guide page is gaining impressions but ranks on page 2–3, expand its FAQ
  section with the actual queries shown in GSC. Match the answer text to what
  the searcher needs.

**High-impressions / low-CTR pages (title fix):**
- Filter for pages with ≥ 200 impressions and < 3% CTR.
- Check the title: is the primary keyword in the first 3 words? Does the title
  include a hook ("Free", "No signup", "Instant", "In your browser")?
- Check the description: does it mention the key differentiator (no upload,
  works offline, no watermark)?
- One test per month — change the title, wait 4 weeks, compare.

### 2. Check per-tool success rates

Open the analytics funnels dashboard (see `DASHBOARDS.md` §1).

- Is every tool's success rate ≥ 95%?
- If a tool dropped: look at Sentry for correlated errors (DASHBOARDS.md §2).
  Filter by the tool slug. Look for a spike in one browser or one file type.
- Triage and assign the top Sentry issue for any tool below 95%.

### 3. Earn 1–2 quality backlinks

This is the most important monthly action for SEO authority. Options, in
rough order of effort/payoff:

- **Directories:** Submit to relevant tool directories that don't require
  payment and have real traffic (e.g., AlternativeTo, Product Hunt, Futurepedia
  for AI-adjacent tools).
- **Genuine forum answers:** Find questions on Reddit, Hacker News, or Stack
  Overflow where the tool is genuinely the right answer. Answer fully, link
  once. Do not spam.
- **Newsletter pitches:** Find newsletters that cover productivity, privacy, or
  document tools. Send a short, genuine pitch — what the tool does, why it's
  different (client-side, no upload), one example use case.
- **Roundup outreach:** Search for "best free PDF tools" articles. Contact the
  authors with a factual note: "You missed a browser-based option — here's what
  makes it different." Link to the comparison page `/best-free-pdf-tools` for
  credibility.
- **Privacy/security bloggers:** The privacy pillar page (`/privacy-first-pdf-tools`)
  is designed to attract links from privacy-focused writers. Pitch it as a
  technically accurate reference on client-side processing.

Track every outreach attempt in a spreadsheet. Links you didn't track don't
compound.

### 4. Update the comparison page (if needed)

Check if any competitor changed their pricing, upload policy, or free-tier
limits since the last check. Update `/best-free-pdf-tools` with the new data
and update the "Last checked" date. Accuracy is what makes the page linkable.

---

## Quarterly tasks (~4 hours)

### 1. Dependency and security review

```bash
pnpm audit              # check for known vulnerabilities
pnpm outdated           # check for stale deps
pnpm tsc --noEmit       # verify zero type errors
node scripts/validate-schema.mjs  # verify schema correctness
```

Update any dependency with a HIGH or CRITICAL severity advisory immediately.
For non-security updates, batch them into one PR per quarter.

### 2. Re-verify Core Web Vitals field data

- Run `node scripts/lighthouse.mjs` against the production URL.
- Cross-check with GSC → Core Web Vitals report.
- If any metric regressed outside the "Good" band: profile with Chrome DevTools,
  identify the offending element or script, fix it. See `DASHBOARDS.md §3` for
  the investigation checklist.

### 3. Re-verify comparison page claims

Visit the pricing pages of each tool listed in `/best-free-pdf-tools` and
confirm the data is still accurate. Competitors change their free tiers
frequently. Update the table and the "Last checked" date.

### 4. Evaluate a new keyword opportunity (only after authority shows)

Only do this after Wave 1 guides are consistently ranking on page 1 for at
least some of their target terms (check GSC position column). Before that, more
content will not help — you need more authority first.

If the condition is met:
- Pick **one** harder term (a Phase-3 head term, e.g., "PDF editor" or
  "sign PDF online").
- Build a dedicated page with: a matching H1, at minimum 800 words of genuine
  content, a clear tool CTA, FAQ section, and internal links from 3+ existing
  pages.
- Run a link-acquisition campaign specifically for that page before expecting
  it to rank.

---

## Decision gates

### "We've published content but aren't ranking — should we write more?"

Wait until month 4 before concluding. If at month 4 the Wave 1 guides have
≥ 1,000 impressions/month in GSC but no clicks:
- The bottleneck is authority (links), not content. Shift effort to off-page
  link-building before publishing more guides.

If the guides have < 100 impressions/month at month 4:
- The site may not be indexed properly. Check GSC Coverage report for errors.
  Verify the sitemap is submitted and returns a 200. Check robots.txt is not
  blocking `/blog/*`.

### "Should we add more tools?"

Add a new Wave 2 tool only when:
1. The existing tools have ≥ 95% success rates in analytics.
2. At least one Wave 1 guide ranks on page 1 for its target term (authority is
   building).
3. The new tool fills a genuine gap in the keyword map, not just "more is more."

### "Should we add paid features / user accounts?"

The deferred paid tier (accounts, server storage, batch processing) makes sense
when:
- Free tool traffic is converting into email/newsletter signups or organic
  referrals (users are returning and recommending).
- GSC shows you ranking for competitive head terms (you have authority).
- A Sentry issue is "we can't serve large files without a server" — not before.

---

## What this site cannot do for you

- **Get backlinks.** Links come from real people who found real value. Writing
  to them, being present in communities, building a reputation — that's the
  operator's job. No automated tool or agent can replace it.
- **Accelerate Google's trust timeline.** New domains take 4–12 months to build
  authority. Publishing more content in month 1 doesn't speed this up.
- **Verify competitor claims in real time.** The comparison page data ages.
  It's the operator's job to re-check it quarterly.

---

*This document should be reviewed and updated quarterly. The most important
thing it says: the build is done; the next constraint is off-page authority.*
