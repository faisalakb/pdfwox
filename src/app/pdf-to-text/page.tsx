import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { PdfToTextShell } from "./PdfToTextShell";

export const dynamic = "force-static";

const TOOL = getTool("/pdf-to-text")!;

export const metadata = buildMetadata(TOOL);

export default function PdfToTextPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <PdfToTextShell />
    </ToolPageLayout>
  );
}
