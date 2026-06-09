import { ImageResponse } from "next/og";
import type { Tool } from "./tools";
import type { GuideMeta } from "./guides";
import { SITE } from "./site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0f0f11";
const ACCENT = "#7c5cfc";
const TEXT = "#f8f7ff";
const MUTED = "#a09ab8";

function OgCard({
  eyebrow,
  title,
  tagline,
}: {
  eyebrow: string;
  title: string;
  tagline: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: BG,
        padding: "64px 72px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: ACCENT,
        }}
      />

      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          P
        </div>
        <span
          style={{ fontSize: 22, fontWeight: 600, color: TEXT, letterSpacing: -0.5 }}
        >
          {SITE.name}
        </span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: ACCENT,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {eyebrow}
        </span>
        <span
          style={{
            fontSize: title.length > 50 ? 44 : 52,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 22,
            color: MUTED,
            lineHeight: 1.4,
          }}
        >
          {tagline}
        </span>
      </div>

      {/* Bottom badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: MUTED,
          fontSize: 15,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: ACCENT,
          }}
        />
        {SITE.tagline}
      </div>
    </div>
  );
}

export function generateToolOgImage(tool: Tool): ImageResponse {
  return new ImageResponse(
    <OgCard
      eyebrow="Free PDF Tool"
      title={tool.name}
      tagline={tool.shortDescription}
    />,
    { ...size },
  );
}

export function generateGuideOgImage(guide: GuideMeta): ImageResponse {
  return new ImageResponse(
    <OgCard
      eyebrow="How-to Guide"
      title={guide.title}
      tagline={guide.description.slice(0, 100)}
    />,
    { ...size },
  );
}

export function generateDefaultOgImage(
  title: string,
  tagline: string,
  eyebrow = "Free PDF Tools",
): ImageResponse {
  return new ImageResponse(
    <OgCard eyebrow={eyebrow} title={title} tagline={tagline} />,
    { ...size },
  );
}
