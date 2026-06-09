import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { WorkerPrewarm } from "@/components/WorkerPrewarm";
import { EmbedShellClient } from "./EmbedShellClient";

export const dynamic = "force-static";

export function generateStaticParams() {
  return tools
    .filter((t) => t.status === "live")
    .map((t) => ({ slug: t.slug.replace(/^\//, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(`/${slug}`);
  if (!tool) return {};
  return {
    title: `${tool.name} — Embed`,
    robots: { index: false, follow: false },
  };
}

const supportedDedicatedSlugs = new Set([
  "/fill-pdf",
  "/create-fillable-pdf",
  "/sign-pdf",
  "/annotate-pdf",
  "/redact-pdf",
  "/protect-pdf",
  "/unlock-pdf",
  "/ocr-pdf",
  "/pdf-to-text",
  "/add-watermark-to-pdf",
  "/remove-watermark-from-pdf",
]);

const supportedImageSlugs = new Set([
  "/heic-to-pdf",
  "/jpg-to-pdf",
  "/png-to-pdf",
  "/webp-to-pdf",
  "/bmp-to-pdf",
  "/gif-to-pdf",
]);

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const toolSlug = `/${slug}`;
  const tool = getTool(toolSlug);
  if (!tool || tool.status !== "live") notFound();

  if (!supportedDedicatedSlugs.has(toolSlug) && !supportedImageSlugs.has(toolSlug)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <WorkerPrewarm />

      {/* Minimal brand bar */}
      <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2">
        <span className="text-sm font-semibold text-[var(--color-ink)]">
          {tool.name}
        </span>
        <Link
          href={`${SITE.url}${tool.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-ink-muted)] underline underline-offset-2 hover:text-[var(--color-ink)]"
        >
          Powered by {SITE.name} ↗
        </Link>
      </header>

      {/* Tool */}
      <main className="flex-1 p-4">
        <EmbedShellClient toolSlug={toolSlug} slug={slug} toolName={tool.name} />
      </main>

      {/* Resize postMessage (parent page can listen to adjust iframe height) */}
      <IframeResizer />
    </div>
  );
}

// Client component that posts its height so parent pages can resize the iframe
function IframeResizer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function(){
  function postHeight(){
    window.parent.postMessage({type:'privpdf-resize',height:document.body.scrollHeight},'*');
  }
  new ResizeObserver(postHeight).observe(document.body);
  postHeight();
})();
`,
      }}
    />
  );
}
