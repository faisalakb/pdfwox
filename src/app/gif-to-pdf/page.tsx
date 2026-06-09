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

const TOOL = getTool("/gif-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function GifToPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ImagesToPdfShell
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
