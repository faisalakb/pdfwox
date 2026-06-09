import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ImagesToPdfShellLazy } from "@/components/ImagesToPdfShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/bmp-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function BmpToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShellLazy
        toolSlug={TOOL.slug}
        accepts={["image/bmp"]}
        enableCanvasDecode
        defaultFilename="bmp-images.pdf"
        dropzoneLabel="Drop your BMP images"
        dropzoneHint="BMP bitmaps are decoded by your browser, then embedded in the PDF."
      />
    </ToolPageLayout>
  );
}
