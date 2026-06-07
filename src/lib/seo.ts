import type { Metadata } from "next";
import { SITE } from "./site";
import type { Tool, ToolFAQ, ToolHowToStep } from "./tools";

/* ─────────────── Metadata helper ─────────────── */

export function buildMetadata(tool: Tool): Metadata {
  const url = `${SITE.url}${tool.slug}`;
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title: tool.title,
      description: tool.description,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.description,
    },
  };
}

/* ─────────────── JSON-LD builders ─────────────── */

type JsonLd = Record<string, unknown>;

export function organizationLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
  };
}

export function websiteLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationLd(tool: Tool): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url: `${SITE.url}${tool.slug}`,
    applicationCategory: "Utility",
    operatingSystem: "Any (web browser)",
    description: tool.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

export function howToLd(
  tool: Tool,
  steps: ToolHowToStep[] = tool.howTo,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: tool.h1,
    description: tool.description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function faqPageLd(faqs: ToolFAQ[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbListLd(
  items: Array<{ name: string; url: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export interface ArticleLdInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  authorName?: string;
}

export function articleLd(input: ArticleLdInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: input.image ?? `${SITE.url}/og-default.png`,
    author: { "@type": "Organization", name: input.authorName ?? SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` },
    },
  };
}

/** Render a JSON-LD <script> tag content from one or more JSON-LD docs. */
export function jsonLdString(...docs: JsonLd[]): string {
  return JSON.stringify(docs.length === 1 ? docs[0] : docs);
}
