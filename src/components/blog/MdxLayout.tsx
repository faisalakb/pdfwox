import { Container } from "@/components/ui/Container";
import { articleLd, jsonLdString } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { TableOfContents, type Heading } from "./TableOfContents";

export interface MdxMeta {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  toolSlug?: string;
}

export interface MdxLayoutProps {
  meta: MdxMeta;
  headings?: Heading[];
  children: React.ReactNode;
}

export function MdxLayout({ meta, headings = [], children }: MdxLayoutProps) {
  const url = `${SITE.url}/blog/${meta.slug}`;
  const ld = jsonLdString(
    articleLd({
      headline: meta.title,
      description: meta.description,
      url,
      datePublished: meta.datePublished,
      dateModified: meta.dateModified,
    }),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ld }}
      />
      <article className="py-12">
        <Container size="lg">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_220px]">
            <div className="max-w-prose min-w-0">
              <header className="mb-8">
                <p className="text-xs tracking-wider text-[var(--color-accent)] uppercase">
                  Guide
                </p>
                <h1 className="mt-2">{meta.title}</h1>
                <p className="mt-3 text-lg leading-relaxed text-[var(--color-ink-muted)]">
                  {meta.description}
                </p>
              </header>
              <div className="text-[var(--color-ink)]">{children}</div>
            </div>
            <aside className="hidden lg:block">
              <TableOfContents headings={headings} />
            </aside>
          </div>
        </Container>
      </article>
    </>
  );
}
