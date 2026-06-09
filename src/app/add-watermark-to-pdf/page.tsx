import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { AddWatermarkShellLazy } from "./AddWatermarkShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/add-watermark-to-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function AddWatermarkPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <AddWatermarkShellLazy />
    </ToolPageLayout>
  );
}
