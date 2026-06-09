import nextDynamic from "next/dynamic";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const dynamic = "force-static";

const SignShell = nextDynamic(
  () => import("./SignShell").then((m) => ({ default: m.SignShell })),
  { ssr: false },
);

const TOOL = getTool("/sign-pdf")!;

export const metadata = buildMetadata(TOOL);

export default function SignPdfPage() {
  return (
    <ToolPageLayout tool={TOOL}>
      <SignShell />
    </ToolPageLayout>
  );
}
