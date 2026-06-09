import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const OcrPdfShell = nextDynamic(
  () => import("./OcrPdfShell").then((m) => ({ default: m.OcrPdfShell })),
  { ssr: false },
);

const TOOL = getTool("/ocr-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function OcrPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <OcrPdfShell />
    </ToolPageLayout>
  );
}
