import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ImagesToPdfShellLazy } from "@/components/ImagesToPdfShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/gif-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function GifToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShellLazy
        toolSlug={TOOL.slug}
        accepts={["image/gif"]}
        enableCanvasDecode
        defaultFilename="gif-images.pdf"
        dropzoneLabel="Drop your GIF images"
        dropzoneHint="The first frame of each GIF is embedded; PDFs don't animate."
      />
    </ToolPageLayout>
  );
}
