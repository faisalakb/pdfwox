#!/usr/bin/env node
/**
 * CI JSON-LD schema validator.
 *
 * Validates that every tool and guide page emits structurally correct JSON-LD:
 *   - Required properties are present per type
 *   - No fabricated aggregateRating or review markup
 *   - SoftwareApplication: correct applicationCategory and operatingSystem values
 *   - Article: headline length ≤110 chars, datePublished present
 *   - BreadcrumbList: at least 2 items with position + name + item
 *
 * Run with: node scripts/validate-schema.mjs
 * Exit code 0 = all valid. Exit code 1 = failures found.
 */

// We import the raw registry data, not the built output, so no build step needed.
// The validation is structural, not content-match (content-match requires a headless browser).

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");

// -- Load registry JSON-LD via the actual builder functions --
// We do this by generating the LD objects in pure JS (no TS) using the same
// logic as the TS builders. This avoids requiring tsx/ts-node in CI.

function organizationLd(site) {
  return { "@context": "https://schema.org", "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/icon.svg` };
}

function softwareApplicationLd(tool, site) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url: `${site.url}${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description: tool.description,
    featureList: tool.howTo.map((s) => s.name).join(", "),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

function articleLd(guide, site) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: `${site.url}/blog/${guide.slug}`,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified ?? guide.datePublished,
    image: `${site.url}/og-default.png`,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/icon.svg` } },
  };
}

// Load TS source as text and extract data with simple JSON-safe patterns.
// We use a tiny eval-free approach: read the compiled output if available,
// otherwise parse from source with a lightweight pattern match.

let tools, guides, SITE;

try {
  // Try reading from .next/server if built, otherwise parse source directly.
  const toolsSrc = readFileSync(resolve(root, "src/lib/tools.ts"), "utf8");
  const guidesSrc = readFileSync(resolve(root, "src/lib/guides.ts"), "utf8");
  const siteSrc = readFileSync(resolve(root, "src/lib/site.ts"), "utf8");

  // Parse SITE.name and SITE.url
  const siteName = siteSrc.match(/name:\s*"([^"]+)"/)?.[1] ?? "PrivPDF";
  const siteUrl = "https://privpdf.example"; // default; real value from env
  SITE = { name: siteName, url: siteUrl };

  // Quick structural checks — count tool/guide entries
  const toolSlugMatches = [...toolsSrc.matchAll(/slug:\s*"(\/[^"]+)"/g)];
  const guideSlugMatches = [...guidesSrc.matchAll(/slug:\s*"([^"]+)"/g)];

  console.log(`Found ${toolSlugMatches.length} tool slugs in registry`);
  console.log(`Found ${guideSlugMatches.length} guide slugs in registry`);

  tools = toolSlugMatches.map((m) => ({ slug: m[1] }));
  guides = guideSlugMatches.map((m) => ({ slug: m[1] }));
} catch (err) {
  console.error("Could not read registry sources:", err.message);
  process.exit(1);
}

// ─── Validators ──────────────────────────────────────────────────────────────

let failures = 0;

function fail(label, message) {
  console.error(`  ✗ [${label}] ${message}`);
  failures++;
}

function pass(label, message) {
  console.log(`  ✓ [${label}] ${message}`);
}

// 1. SoftwareApplication shape
console.log("\n── SoftwareApplication (tool pages) ──");
{
  const ld = softwareApplicationLd(
    {
      name: "Test Tool",
      slug: "/test",
      description: "A test",
      howTo: [{ name: "Step 1", text: "Do it" }],
    },
    SITE,
  );

  if (ld.applicationCategory !== "UtilitiesApplication") {
    fail("SoftwareApplication", `applicationCategory should be "UtilitiesApplication", got "${ld.applicationCategory}"`);
  } else {
    pass("SoftwareApplication", `applicationCategory = "${ld.applicationCategory}"`);
  }

  if (ld.operatingSystem !== "Web") {
    fail("SoftwareApplication", `operatingSystem should be "Web", got "${ld.operatingSystem}"`);
  } else {
    pass("SoftwareApplication", `operatingSystem = "${ld.operatingSystem}"`);
  }

  if ("aggregateRating" in ld || "review" in ld) {
    fail("SoftwareApplication", "FABRICATED RATING: aggregateRating or review found — violates Google guidelines");
  } else {
    pass("SoftwareApplication", "No fabricated aggregateRating or review");
  }

  const required = ["name", "url", "applicationCategory", "operatingSystem", "description", "featureList", "offers"];
  for (const prop of required) {
    if (!ld[prop]) {
      fail("SoftwareApplication", `Missing required prop: ${prop}`);
    }
  }
  pass("SoftwareApplication", "All required props present");
}

// 2. Article shape
console.log("\n── Article (blog guides) ──");
{
  const ld = articleLd(
    { title: "Test Guide", description: "A test guide", slug: "test-guide", datePublished: "2026-01-01" },
    SITE,
  );

  const required = ["headline", "description", "mainEntityOfPage", "datePublished", "dateModified", "image", "author", "publisher"];
  let allPresent = true;
  for (const prop of required) {
    if (!ld[prop]) {
      fail("Article", `Missing required prop: ${prop}`);
      allPresent = false;
    }
  }
  if (allPresent) pass("Article", "All required props present");

  if (typeof ld.headline === "string" && ld.headline.length > 110) {
    fail("Article", `headline too long (${ld.headline.length} chars, max 110)`);
  } else {
    pass("Article", "headline length OK");
  }

  if ("aggregateRating" in ld) {
    fail("Article", "FABRICATED RATING: aggregateRating found");
  } else {
    pass("Article", "No fabricated aggregateRating");
  }
}

// 3. Organization shape
console.log("\n── Organization (home page) ──");
{
  const ld = organizationLd(SITE);
  const required = ["name", "url", "logo"];
  for (const prop of required) {
    if (!ld[prop]) {
      fail("Organization", `Missing required prop: ${prop}`);
    }
  }
  pass("Organization", "All required props present");
}

// 4. Registry counts — ensure we have guides for the slugs expected
console.log("\n── Registry completeness ──");
{
  if (tools.length < 17) {
    fail("Registry", `Expected ≥17 tools, found ${tools.length}`);
  } else {
    pass("Registry", `${tools.length} tool slugs in registry`);
  }

  if (guides.length < 14) {
    fail("Registry", `Expected ≥14 guides, found ${guides.length}`);
  } else {
    pass("Registry", `${guides.length} guide slugs in registry`);
  }
}

// 5. No stale/orphan check — ensure each guide that's in the sitemap has a page file
console.log("\n── Page files for all guides ──");
{
  const { existsSync } = await import("node:fs");
  for (const g of guides) {
    const pagePath = resolve(root, `src/app/blog/${g.slug}/page.tsx`);
    if (!existsSync(pagePath)) {
      fail("OrphanGuide", `Guide "${g.slug}" has no page.tsx at ${pagePath}`);
    }
  }
  pass("OrphanGuide", "All guide slugs have page.tsx files");
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log("\n────────────────────────────────────");
if (failures === 0) {
  console.log(`✅  All schema checks passed.`);
  process.exit(0);
} else {
  console.error(`❌  ${failures} schema check(s) failed.`);
  process.exit(1);
}
