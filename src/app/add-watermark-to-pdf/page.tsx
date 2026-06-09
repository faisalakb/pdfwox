import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const AddWatermarkShell = nextDynamic(
  () =>
    import("./AddWatermarkShell").then((m) => ({
      default: m.AddWatermarkShell,
    })),
  { ssr: false },
);

const TOOL = getTool("/add-watermark-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function AddWatermarkPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <AddWatermarkShell />
    </ToolPageLayout>
  );
}
