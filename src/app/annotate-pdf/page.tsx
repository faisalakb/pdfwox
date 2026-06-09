import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { AnnotateShellLazy } from "./AnnotateShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/annotate-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function AnnotatePdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <AnnotateShellLazy />
    </ToolPageLayout>
  );
}
