import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { WorkerPrewarm } from "@/components/WorkerPrewarm";

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

// Dynamically imported shells — each is a named export from its route folder
// or the shared ImagesToPdfShell. We load only the one needed.
const shellMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  "/fill-pdf": () =>
    import("@/app/fill-pdf/FillShell").then((m) => ({ default: m.FillShell })),
  "/create-fillable-pdf": () =>
    import("@/app/create-fillable-pdf/CreateShell").then((m) => ({
      default: m.CreateShell,
    })),
  "/sign-pdf": () =>
    import("@/app/sign-pdf/SignShell").then((m) => ({ default: m.SignShell })),
  "/annotate-pdf": () =>
    import("@/app/annotate-pdf/AnnotateShell").then((m) => ({
      default: m.AnnotateShell,
    })),
  "/redact-pdf": () =>
    import("@/app/redact-pdf/RedactShell").then((m) => ({
      default: m.RedactShell,
    })),
  "/protect-pdf": () =>
    import("@/app/protect-pdf/ProtectShell").then((m) => ({
      default: m.ProtectShell,
    })),
  "/unlock-pdf": () =>
    import("@/app/unlock-pdf/UnlockShell").then((m) => ({
      default: m.UnlockShell,
    })),
  "/ocr-pdf": () =>
    import("@/app/ocr-pdf/OcrPdfShell").then((m) => ({
      default: m.OcrPdfShell,
    })),
  "/pdf-to-text": () =>
    import("@/app/pdf-to-text/PdfToTextShell").then((m) => ({
      default: m.PdfToTextShell,
    })),
  "/add-watermark-to-pdf": () =>
    import("@/app/add-watermark-to-pdf/AddWatermarkShell").then((m) => ({
      default: m.AddWatermarkShell,
    })),
  "/remove-watermark-from-pdf": () =>
    import("@/app/remove-watermark-from-pdf/RemoveWatermarkShell").then(
      (m) => ({ default: m.RemoveWatermarkShell }),
    ),
};

// Image converter tools share one shell component with props
const imageMimeMap: Record<string, string[]> = {
  "/heic-to-pdf": ["image/heic", "image/heif"],
  "/jpg-to-pdf": ["image/jpeg"],
  "/png-to-pdf": ["image/png"],
  "/webp-to-pdf": ["image/webp"],
  "/bmp-to-pdf": ["image/bmp"],
  "/gif-to-pdf": ["image/gif"],
};

const ImageShell = nextDynamic(
  () =>
    import("@/components/ImagesToPdfShell").then((m) => ({
      default: m.ImagesToPdfShell,
    })),
  { ssr: false },
);

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const toolSlug = `/${slug}`;
  const tool = getTool(toolSlug);
  if (!tool || tool.status !== "live") notFound();

  const isImageConverter = toolSlug in imageMimeMap;
  const hasDedicatedShell = toolSlug in shellMap;

  if (!isImageConverter && !hasDedicatedShell) notFound();

  const DedicatedShell = hasDedicatedShell
    ? nextDynamic(shellMap[toolSlug]!, { ssr: false })
    : null;

  const imageMimes = imageMimeMap[toolSlug];

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
        {DedicatedShell && <DedicatedShell />}
        {isImageConverter && (
          <ImageShell
            toolSlug={toolSlug}
            accepts={imageMimes}
            enableHeic={toolSlug === "/heic-to-pdf"}
            enableCanvasDecode={["/webp-to-pdf", "/bmp-to-pdf", "/gif-to-pdf"].includes(toolSlug)}
            defaultFilename={`${slug}.pdf`}
            dropzoneLabel={`Drop your ${tool.name.replace(" to PDF", "")} files`}
            dropzoneHint="Files stay on your device."
          />
        )}
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
