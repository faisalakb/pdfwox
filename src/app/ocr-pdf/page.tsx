import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { OcrPdfShell } from "./OcrPdfShell";

export const dynamic = "force-static";

const TOOL = getTool("/ocr-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function OcrPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <OcrPdfShell />
    </ToolPageLayout>
  );
}
