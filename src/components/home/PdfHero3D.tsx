"use client";

import nextDynamic from "next/dynamic";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

// Only the WebGL layer is deferred — the headline, copy, and CTAs
// below are in the static HTML payload, so crawlers and LCP never
// wait on three.js. The gradient backdrop stands in until the
// canvas hydrates (and stays if WebGL is unavailable).
const PdfHeroCanvas = nextDynamic(() => import("./PdfHeroCanvas"), {
  ssr: false,
});

// One floating page per tool, live tools leading the orbit.
// Module-level so the array identity is stable across renders
// and the scene is never rebuilt.
const TOOL_LABELS = [...tools]
  .sort((a, b) => (a.status === b.status ? 0 : a.status === "live" ? -1 : 1))
  .map((t) => t.name);

export function PdfHero3D() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "92vh",
        background:
          "radial-gradient(ellipse at 50% 30%, #1A2140 0%, #10152A 55%, #0B0F1F 100%)",
      }}
    >
      {/* 3D canvas (lazy, client-only) — one labeled page per tool */}
      <PdfHeroCanvas labels={TOOL_LABELS} />

      {/* centre vignette so text stays readable over the pages */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(11,15,31,0.82) 0%, rgba(11,15,31,0.28) 45%, rgba(11,15,31,0) 70%)",
        }}
      />

      {/* hero copy — server-rendered, crawlable */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center"
        style={{ minHeight: "92vh" }}
      >
        <p
          className="mb-5 text-xs font-medium tracking-widest uppercase"
          style={{ color: "#C9B87F", letterSpacing: "0.3em" }}
        >
          {SITE.tagline}
        </p>

        <h1
          className="font-display mb-6"
          style={{
            color: "#F7F2E8",
            fontSize: "clamp(2.4rem, 5vw + 1rem, 4.2rem)",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
          }}
        >
          Your documents,
          <br />
          <span style={{ color: "#E2553D" }}>finally under control.</span>
        </h1>

        <p
          className="mb-10 max-w-xl text-base leading-relaxed md:text-lg"
          style={{ color: "#9AA3C4" }}
        >
          Fill, sign, redact, convert, protect — right here in your browser.
          Nothing is uploaded. No accounts, no watermarks, no nonsense.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="#tools"
            className="focus-ring rounded-full px-8 py-4 text-base font-semibold transition-all hover:scale-105 hover:brightness-110"
            style={{ background: "#E2553D", color: "#FFF7EE" }}
          >
            Browse all tools
          </a>
          <a
            href="/why-browser-based"
            className="focus-ring rounded-full border px-8 py-4 text-base font-medium transition-colors hover:bg-white/5"
            style={{
              borderColor: "#3A4368",
              color: "#D8DCEE",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Why browser-based? →
          </a>
        </div>
      </div>

      {/* scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-40"
        aria-hidden="true"
      >
        <span
          className="text-[10px] tracking-widest uppercase"
          style={{ color: "#C9B87F" }}
        >
          Scroll
        </span>
        <div className="h-8 w-px bg-gradient-to-b from-[#C9B87F] to-transparent" />
      </div>
    </section>
  );
}
