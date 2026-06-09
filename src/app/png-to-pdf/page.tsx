import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ImagesToPdfShellLazy } from "@/components/ImagesToPdfShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/png-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function PngToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShellLazy
        toolSlug={TOOL.slug}
        accepts={["image/png"]}
        defaultFilename="png-images.pdf"
        dropzoneLabel="Drop your PNG images"
        dropzoneHint="Multiple PNGs are combined in the order you set."
      />
    </ToolPageLayout>
  );
}
