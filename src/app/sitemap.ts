import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

const STATIC_PATHS = ["/", "/about", "/privacy", "/why-browser-based"];

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

  // Blog guide stubs (registry-driven).
  const guideSlugs = Array.from(
    new Set(
      tools.map((t) => t.guideSlug).filter((g): g is string => Boolean(g)),
    ),
  );
  const guideEntries: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...toolEntries, ...guideEntries];
}
