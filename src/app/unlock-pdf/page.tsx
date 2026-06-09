import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const UnlockShell = nextDynamic(
  () => import("./UnlockShell").then((m) => ({ default: m.UnlockShell })),
  { ssr: false },
);

const TOOL = getTool("/unlock-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function UnlockPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <UnlockShell />
    </ToolPageLayout>
  );
}
