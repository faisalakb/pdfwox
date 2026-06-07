import type { MDXComponents } from "mdx/types";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import Link from "next/link";

/**
 * Mandatory App Router MDX component map (required by Next.js).
 * Maps element tags to styled components using the Week 1 design tokens.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="mt-2 mb-6" {...props} />
    ),
    h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="mt-12 mb-4 scroll-mt-24" {...props} />
    ),
    h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="mt-8 mb-3 scroll-mt-24" {...props} />
    ),
    p: (props: HTMLAttributes<HTMLParagraphElement>) => (
      <p className="my-4 leading-relaxed text-[var(--color-ink)]" {...props} />
    ),
    a: ({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const isInternal = href?.startsWith("/");
      if (isInternal) {
        return (
          <Link
            href={href!}
            className="focus-ring text-[var(--color-accent)] underline decoration-from-font underline-offset-2 hover:text-[var(--color-accent-hover)]"
            {...rest}
          />
        );
      }
      return (
        <a
          href={href}
          className="focus-ring text-[var(--color-accent)] underline decoration-from-font underline-offset-2 hover:text-[var(--color-accent-hover)]"
          rel="noopener noreferrer"
          target="_blank"
          {...rest}
        />
      );
    },
    ul: (props: HTMLAttributes<HTMLUListElement>) => (
      <ul className="my-4 list-disc space-y-1.5 pl-6" {...props} />
    ),
    ol: (props: HTMLAttributes<HTMLOListElement>) => (
      <ol className="my-4 list-decimal space-y-1.5 pl-6" {...props} />
    ),
    li: (props: HTMLAttributes<HTMLLIElement>) => (
      <li className="leading-relaxed" {...props} />
    ),
    code: (props: HTMLAttributes<HTMLElement>) => (
      <code
        className="rounded-[var(--radius-xs)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 font-mono text-[0.92em]"
        {...props}
      />
    ),
    pre: (props: HTMLAttributes<HTMLPreElement>) => (
      <pre
        className="my-5 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm leading-relaxed"
        {...props}
      />
    ),
    blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote
        className="my-5 border-l-4 border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-2 text-[var(--color-ink-muted)] italic"
        {...props}
      />
    ),
    hr: () => <hr className="my-10 border-[var(--color-line)]" />,
    ...components,
  };
}
