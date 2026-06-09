import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import { allCategories, categoryMeta, toolsByCategory } from "@/lib/tools";

export function SiteFooter() {
  const byCat = toolsByCategory();

  return (
    <footer
      className="border-t"
      style={{ background: "#0B0F1F", borderColor: "#1E2640" }}
    >
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {/* Brand column */}
          <div className="col-span-2">
            <Link
              href="/"
              className="focus-ring font-display inline-flex items-center gap-2.5 text-lg"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold"
                style={{ background: "#E2553D", color: "#fff" }}
              >
                W
              </span>
              <span style={{ color: "#F7F2E8" }}>{SITE.shortName}</span>
            </Link>
            <p
              className="mt-3 max-w-sm text-sm leading-relaxed"
              style={{ color: "#6B7494" }}
            >
              {SITE.description}
            </p>
            <p
              className="mt-4 inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1 text-xs"
              style={{ borderColor: "#3A4368", color: "#9AA3C4" }}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#E2553D" }}
              />
              {SITE.tagline}
            </p>
          </div>

          {/* Category columns */}
          {allCategories.map((c) => {
            const list = byCat[c];
            if (!list.length) return null;
            return (
              <div key={c}>
                <h4
                  className="text-xs font-semibold tracking-wider uppercase"
                  style={{ color: "#C9B87F" }}
                >
                  {categoryMeta[c].label}
                </h4>
                <ul className="mt-3 space-y-2">
                  {list.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={t.slug}
                        className="focus-ring text-sm transition-colors hover:text-white"
                        style={{ color: "#6B7494" }}
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "#1E2640", color: "#4A5070" }}
        >
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { href: "/about", label: "About" },
              { href: "/privacy", label: "Privacy" },
              { href: "/why-browser-based", label: "Why browser-based" },
              { href: "/blog", label: "Guides" },
              { href: "/changelog", label: "Changelog" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="focus-ring transition-colors hover:text-white"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
