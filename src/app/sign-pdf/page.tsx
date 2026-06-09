import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { SignShellLazy } from "./SignShellLazy";

export const dynamic = "force-static";

const TOOL = getTool("/sign-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function SignPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <SignShellLazy />
    </ToolPageLayout>
  );
}
