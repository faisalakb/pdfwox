import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const FillShell = nextDynamic(
  () => import("./FillShell").then((m) => ({ default: m.FillShell })),
  { ssr: false },
);

const TOOL = getTool("/fill-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function FillPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <FillShell />
    </ToolPageLayout>
  );
}
