import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const PdfToTextShell = nextDynamic(
  () =>
    import("./PdfToTextShell").then((m) => ({ default: m.PdfToTextShell })),
  { ssr: false },
);

const TOOL = getTool("/pdf-to-text")!;

export const metadata = buildMetadata(TOOL);

export default function PdfToTextPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <PdfToTextShell />
    </ToolPageLayout>
  );
}
