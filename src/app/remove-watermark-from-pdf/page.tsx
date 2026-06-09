import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { RemoveWatermarkShellLazy } from "./RemoveWatermarkShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/remove-watermark-from-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function RemoveWatermarkPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <RemoveWatermarkShellLazy />
    </ToolPageLayout>
  );
}
