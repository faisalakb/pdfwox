import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { AnnotateShell } from "./AnnotateShell";

export const dynamic = "force-static";

const TOOL = getTool("/annotate-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function AnnotatePdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <AnnotateShell />
    </ToolPageLayout>
  );
}
