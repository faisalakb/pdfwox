import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { SignShell } from "./SignShell";

export const dynamic = "force-static";

const TOOL = getTool("/sign-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function SignPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <SignShell />
    </ToolPageLayout>
  );
}
