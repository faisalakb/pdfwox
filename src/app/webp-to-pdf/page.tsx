import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const ImagesToPdfShell = nextDynamic(
  () =>
    import("@/components/ImagesToPdfShell").then((m) => ({
      default: m.ImagesToPdfShell,
    })),
  { ssr: false },
);

const TOOL = getTool("/webp-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function WebpToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShell
        toolSlug={TOOL.slug}
        accepts={["image/webp"]}
        enableCanvasDecode
        defaultFilename="webp-images.pdf"
        dropzoneLabel="Drop your WebP images"
        dropzoneHint="WebP is decoded by your browser, then embedded in the PDF."
      />
    </ToolPageLayout>
  );
}
