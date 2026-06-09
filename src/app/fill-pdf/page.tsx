import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { FillShellLazy } from "./FillShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/fill-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function FillPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <FillShellLazy />
    </ToolPageLayout>
  );
}
