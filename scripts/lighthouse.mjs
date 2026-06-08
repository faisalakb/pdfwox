#!/usr/bin/env node
/**
 * Local Lighthouse gate.
 *
 *   pnpm build && pnpm lh
 *
 * Boots the prod Next.js server, runs Lighthouse against a handful of
 * critical routes, and asserts LCP / INP / CLS budgets. Exits non-zero
 * if any route fails so this can guard a CI step.
 *
 * Why local-only: hosted Lighthouse-CI needs a public URL or a GitHub
 * token. This script needs neither — it boots the server, talks to it
 * over localhost, and exits.
 *
 * Chrome resolution: lighthouse picks up a system Chrome via
 * chrome-launcher. On a build host without one (e.g. minimal CI images),
 * point CHROME_PATH at any Chromium binary — the Playwright-installed
 * Chromium at ~/.cache/ms-playwright/chromium-*\/chrome-linux/chrome
 * works.
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const ROUTES = [
  "/",
  "/fill-pdf",
  "/heic-to-pdf",
  "/unlock-pdf",
  "/why-browser-based",
];

// Budgets in ms (LCP, INP) and unitless (CLS). Conservative for v1; the
// spec calls for "green" — these match Google's "good" thresholds.
const BUDGETS = {
  lcp: 2500,
  inp: 200,
  cls: 0.1,
};

const PORT = 4500;
const BASE = `http://localhost:${PORT}`;

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return;
    } catch {
      /* keep polling */
    }
    await delay(500);
  }
  throw new Error(`server not ready after ${timeoutMs}ms`);
}

async function runLighthouse(url) {
  const { default: lighthouse } = await import("lighthouse");
  const { launch } = await import("chrome-launcher");

  const chrome = await launch({
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
    chromePath: process.env.CHROME_PATH,
  });

  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance"],
      },
      {
        extends: "lighthouse:default",
        settings: {
          formFactor: "mobile",
          throttlingMethod: "simulate",
        },
      },
    );
    const audits = result.lhr.audits;
    return {
      lcp: audits["largest-contentful-paint"]?.numericValue ?? Infinity,
      tbt: audits["total-blocking-time"]?.numericValue ?? Infinity,
      // INP isn't in static LH; using TBT as a proxy as Google does.
      cls: audits["cumulative-layout-shift"]?.numericValue ?? Infinity,
      score: result.lhr.categories.performance?.score ?? 0,
    };
  } finally {
    await chrome.kill();
  }
}

async function main() {
  // Boot prod server in background.
  const server = spawn(
    "node_modules/.bin/next",
    ["start", "--port", String(PORT)],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL:
          process.env.NEXT_PUBLIC_SITE_URL ?? "https://privpdf.example",
      },
    },
  );
  server.stdout?.on("data", () => {});
  server.stderr?.on("data", () => {});

  try {
    await waitForServer(`${BASE}/`);
    let failed = 0;
    for (const route of ROUTES) {
      const url = `${BASE}${route}`;
      process.stdout.write(`lh ${route.padEnd(28)} `);
      try {
        const { lcp, tbt, cls, score } = await runLighthouse(url);
        const lcpOk = lcp <= BUDGETS.lcp;
        const inpOk = tbt <= BUDGETS.inp * 4; // TBT proxy is ~4× INP
        const clsOk = cls <= BUDGETS.cls;
        const ok = lcpOk && inpOk && clsOk;
        if (!ok) failed++;
        console.log(
          `score=${Math.round(score * 100)} ` +
            `LCP=${Math.round(lcp)}ms${lcpOk ? "" : "✗"} ` +
            `TBT=${Math.round(tbt)}ms${inpOk ? "" : "✗"} ` +
            `CLS=${cls.toFixed(3)}${clsOk ? "" : "✗"} ` +
            (ok ? "✓" : "FAIL"),
        );
      } catch (e) {
        failed++;
        console.log(`ERROR ${e instanceof Error ? e.message : e}`);
      }
    }
    if (failed > 0) {
      console.error(`\nlighthouse: ${failed} route(s) failed budgets`);
      process.exit(1);
    }
    console.log("\nlighthouse: ok");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
