import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { UnlockShell } from "./UnlockShell";

export const dynamic = "force-static";

const TOOL = getTool("/unlock-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function UnlockPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <UnlockShell />
    </ToolPageLayout>
  );
}
