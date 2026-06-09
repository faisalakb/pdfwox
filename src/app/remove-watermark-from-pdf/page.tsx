import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const RemoveWatermarkShell = nextDynamic(
  () =>
    import("./RemoveWatermarkShell").then((m) => ({
      default: m.RemoveWatermarkShell,
    })),
  { ssr: false },
);

const TOOL = getTool("/remove-watermark-from-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function RemoveWatermarkPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <RemoveWatermarkShell />
    </ToolPageLayout>
  );
}
