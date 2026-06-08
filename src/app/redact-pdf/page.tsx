import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { RedactShell } from "./RedactShell";

export const dynamic = "force-static";

const TOOL = getTool("/redact-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function RedactPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <RedactShell />
    </ToolPageLayout>
  );
}
