import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { CreateShellLazy } from "./CreateShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/create-fillable-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function CreateFillablePdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <CreateShellLazy />
    </ToolPageLayout>
  );
}
