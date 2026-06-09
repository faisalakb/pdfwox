import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const CreateShell = nextDynamic(
  () => import("./CreateShell").then((m) => ({ default: m.CreateShell })),
  { ssr: false },
);

const TOOL = getTool("/create-fillable-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function CreateFillablePdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <CreateShell />
    </ToolPageLayout>
  );
}
