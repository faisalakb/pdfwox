import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const RedactShell = nextDynamic(
  () => import("./RedactShell").then((m) => ({ default: m.RedactShell })),
  { ssr: false },
);

const TOOL = getTool("/redact-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function RedactPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <RedactShell />
    </ToolPageLayout>
  );
}
