# Launch submission checklist

Steps tagged **HUMAN** in the build spec — they need an account at the
listed service. Run through these on the day you flip DNS to production.

## 0. Pre-launch

- [ ] Production domain points at the deployment host (Vercel / Cloudflare Pages).
- [ ] HTTPS enforced; HTTP → HTTPS redirect verified.
- [ ] `www` vs apex decided; the other variant 301s to the canonical.
- [ ] `NEXT_PUBLIC_SITE_URL` env var on the host matches the canonical (no trailing slash).
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set if Sentry capture is wanted in production.
- [ ] Lighthouse run against the production URL — LCP/INP/CLS all green
      on the 5 key routes (`/`, `/fill-pdf`, `/heic-to-pdf`, `/unlock-pdf`,
      `/blog/how-to-make-a-pdf-fillable`).

## 1. Google Search Console

1. Visit https://search.google.com/search-console
2. Add a new property → "URL prefix" → enter your canonical
   `https://privpdf.example` (or whatever you launched as).
3. Choose **HTML tag** as the verification method.
4. Copy the `content="…"` value out of the meta tag GSC shows you.
5. Set the env var on your host:

   ```
   NEXT_PUBLIC_GSC_VERIFICATION=the-value-from-step-4
   ```

6. Redeploy. Check the production HTML — `view-source` should now show
   `<meta name="google-site-verification" content="…">` in the `<head>`.
7. Back in GSC, click **Verify**.
8. Once verified, in the left sidebar: **Sitemaps** → enter `sitemap.xml`
   → **Submit**.
9. For each Wave 1 tool URL + the two paired guides + the pillar page,
   open **URL Inspection** → paste the URL → **Request indexing**:
   - `/fill-pdf`
   - `/create-fillable-pdf`
   - `/heic-to-pdf`
   - `/png-to-pdf`
   - `/jpg-to-pdf`
   - `/unlock-pdf`
   - `/protect-pdf`
   - `/blog/how-to-make-a-pdf-fillable`
   - `/blog/how-to-turn-iphone-photos-into-a-pdf`
   - `/blog/how-to-remove-password-from-pdf`
   - `/why-browser-based`

## 2. Bing Webmaster Tools

1. Visit https://www.bing.com/webmasters
2. Add your site (or import from Google Search Console if you've already
   set up GSC above — Bing supports this and it saves the verification
   step).
3. If you're not importing from GSC: choose **Meta tag** verification.
4. Copy the value out of the meta tag (`content="…"`).
5. Set the env var:

   ```
   NEXT_PUBLIC_BING_VERIFICATION=the-value-from-step-4
   ```

6. Redeploy. `view-source` should show `<meta name="msvalidate.01" …>`.
7. **Verify**.
8. **Sitemaps** → submit `https://your-domain/sitemap.xml`.

## 3. Analytics (Week 5 optional, Week 6 by default)

If you decided to wire Plausible / Cloudflare Web Analytics for v1:

- Add the analytics script via your host's edge-side injection, or wire
  it into `instrumentation-client.ts` next to the Sentry init.
- The event taxonomy in `src/lib/analytics.ts` is already structured —
  the `track()` no-op there is where the provider call goes.

## 4. Outreach (the long game)

These are **the** thing that moves rankings. The build alone does not
rank the site.

- [ ] Submit to free-tool directories (alternativeto.net,
      tools.directories, etc.).
- [ ] Pitch the pillar page (`/why-browser-based`) as a guest post or as
      a citation in a privacy / dev-productivity newsletter.
- [ ] Soft Product Hunt launch when ≥ 7 tools are live.
- [ ] Answer questions on Reddit / Quora / StackExchange with the
      relevant tool linked — only where the answer is genuinely useful.
- [ ] ~1–2 quality backlinks per month is the realistic pace.

## 5. Status snapshot

| Item                            | Default          | Override                          |
|---------------------------------|------------------|-----------------------------------|
| Canonical URL                   | `SITE.url`       | `NEXT_PUBLIC_SITE_URL`            |
| Google verification meta        | _not emitted_    | `NEXT_PUBLIC_GSC_VERIFICATION`    |
| Bing verification meta          | _not emitted_    | `NEXT_PUBLIC_BING_VERIFICATION`   |
| Sentry DSN                      | _not initialized_| `NEXT_PUBLIC_SENTRY_DSN`          |

All four are read at build time. Set them on your host, redeploy.
