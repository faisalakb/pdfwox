import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const AnnotateShell = nextDynamic(
  () => import("./AnnotateShell").then((m) => ({ default: m.AnnotateShell })),
  { ssr: false },
);

const TOOL = getTool("/annotate-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function AnnotatePdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <AnnotateShell />
    </ToolPageLayout>
  );
}
