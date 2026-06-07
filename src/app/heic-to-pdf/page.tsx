import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ImagesToPdfShell } from "@/components/ImagesToPdfShell";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const TOOL = getTool("/heic-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function HeicToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShell
        toolSlug={TOOL.slug}
        accepts={["image/heic", "image/heif"]}
        enableHeic
        defaultFilename="iphone-photos.pdf"
        dropzoneLabel="Drop your iPhone HEIC photos"
        dropzoneHint="HEIC and HEIF are supported. Files stay on your device."
      />
    </ToolPageLayout>
  );
}
