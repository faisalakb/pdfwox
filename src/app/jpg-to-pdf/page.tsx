import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ImagesToPdfShellLazy } from "@/components/ImagesToPdfShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/jpg-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function JpgToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShellLazy
        toolSlug={TOOL.slug}
        accepts={["image/jpeg"]}
        defaultFilename="jpg-images.pdf"
        dropzoneLabel="Drop your JPG photos"
        dropzoneHint="JPEG bytes are embedded without re-encoding."
      />
    </ToolPageLayout>
  );
}
