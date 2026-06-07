# Test assets

Deterministic fixtures consumed by Vitest and Playwright.

- `two-page.pdf`, `three-page.pdf` — minimal blank PDFs at 400×400, used by `merge.test.ts` and `e2e/demo-merge.spec.ts`.
- `1x1.png`, `1x1.jpg` — one-pixel images for image-conversion paths.

Regenerate with:

```
pnpm fixtures:gen
```

HEIC fixtures are intentionally **not** committed (binary, brittle). HEIC-dependent tests skip when the fixture is absent. They land alongside Week 3's HEIC tool.

Corrupt-file tests synthesize a 64-byte garbage buffer inline rather than committing a fixture.
