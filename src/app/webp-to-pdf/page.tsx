import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ImagesToPdfShellLazy } from "@/components/ImagesToPdfShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/webp-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function WebpToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShellLazy
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
