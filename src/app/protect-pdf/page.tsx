import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ProtectShell } from "./ProtectShell";

export const dynamic = "force-static";

const TOOL = getTool("/protect-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function ProtectPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ProtectShell />
    </ToolPageLayout>
  );
}
