import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const ProtectShell = nextDynamic(
  () => import("./ProtectShell").then((m) => ({ default: m.ProtectShell })),
  { ssr: false },
);

const TOOL = getTool("/protect-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function ProtectPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <ProtectShell />
    </ToolPageLayout>
  );
}
