import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

const STATIC_PATHS = ["/", "/about", "/privacy", "/why-browser-based", "/blog"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE.url;

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.7,
  }));

  const toolEntries: MetadataRoute.Sitemap = tools.map((t) => ({
    url: `${base}${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // All blog guides — driven by the guides registry so none are missed.
  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${base}/blog/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...toolEntries, ...guideEntries];
}
