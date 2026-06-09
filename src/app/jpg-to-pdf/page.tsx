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

const TOOL = getTool("/jpg-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function JpgToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShell
        toolSlug={TOOL.slug}
        accepts={["image/jpeg"]}
        defaultFilename="jpg-images.pdf"
        dropzoneLabel="Drop your JPG photos"
        dropzoneHint="JPEG bytes are embedded without re-encoding."
      />
    </ToolPageLayout>
  );
}
