import { describe, expect, it } from "vitest";
import {
  articleLd,
  breadcrumbListLd,
  faqPageLd,
  howToLd,
  jsonLdString,
  organizationLd,
  softwareApplicationLd,
  websiteLd,
} from "./seo";
import { tools } from "./tools";

describe("JSON-LD builders (CI Rich-Results-Test stand-in)", () => {
  const tool = tools[0]!;

  it("organization has @type Organization", () => {
    const ld = organizationLd();
    expect(ld["@type"]).toBe("Organization");
    expect(ld["@context"]).toBe("https://schema.org");
  });

  it("website has @type WebSite", () => {
    expect(websiteLd()["@type"]).toBe("WebSite");
  });

  it("softwareApplication has required fields", () => {
    const ld = softwareApplicationLd(tool);
    expect(ld["@type"]).toBe("SoftwareApplication");
    expect(ld.name).toBe(tool.name);
    expect(ld.offers).toMatchObject({ price: "0", priceCurrency: "USD" });
  });

  it("howTo emits one step per tool.howTo entry", () => {
    const ld = howToLd(tool) as { step: unknown[] };
    expect(ld["@type" as keyof typeof ld]).toBe("HowTo");
    expect(ld.step.length).toBe(tool.howTo.length);
  });

  it("faqPage emits one question per faq", () => {
    const ld = faqPageLd(tool.faqs) as { mainEntity: unknown[] };
    expect(ld["@type" as keyof typeof ld]).toBe("FAQPage");
    expect(ld.mainEntity.length).toBe(tool.faqs.length);
  });

  it("breadcrumbList is positional", () => {
    const ld = breadcrumbListLd([
      { name: "Home", url: "https://x.test/" },
      { name: "Tool", url: "https://x.test/tool" },
    ]) as { itemListElement: Array<{ position: number; name: string }> };
    expect(ld["@type" as keyof typeof ld]).toBe("BreadcrumbList");
    expect(ld.itemListElement[0]?.position).toBe(1);
    expect(ld.itemListElement[1]?.position).toBe(2);
  });

  it("article has datePublished and publisher", () => {
    const ld = articleLd({
      headline: "Test",
      description: "Test",
      url: "https://x.test/blog/test",
      datePublished: "2025-01-01",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Article");
    expect(ld.datePublished).toBe("2025-01-01");
    expect(ld.publisher).toBeDefined();
  });

  it("jsonLdString round-trips through JSON.parse", () => {
    const s = jsonLdString(softwareApplicationLd(tool), howToLd(tool));
    const parsed = JSON.parse(s) as Array<Record<string, unknown>>;
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]?.["@type"]).toBe("SoftwareApplication");
    expect(parsed[1]?.["@type"]).toBe("HowTo");
  });

  it("every tool produces a valid combined LD block", () => {
    for (const t of tools) {
      const s = jsonLdString(
        softwareApplicationLd(t),
        howToLd(t),
        faqPageLd(t.faqs),
        breadcrumbListLd([{ name: "Home", url: "https://x.test/" }]),
      );
      const parsed = JSON.parse(s) as Array<Record<string, unknown>>;
      expect(parsed.length).toBe(4);
      expect(parsed[0]?.["@type"]).toBe("SoftwareApplication");
      expect(parsed[1]?.["@type"]).toBe("HowTo");
      expect(parsed[2]?.["@type"]).toBe("FAQPage");
      expect(parsed[3]?.["@type"]).toBe("BreadcrumbList");
    }
  });
});
