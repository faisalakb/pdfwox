import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { FillShell } from "./FillShell";

export const dynamic = "force-static";

const TOOL = getTool("/fill-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function FillPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <FillShell />
    </ToolPageLayout>
  );
}
