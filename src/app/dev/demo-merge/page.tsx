import type { Metadata } from "next";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import type { Tool } from "@/lib/tools";
import { DemoMergeShell } from "./demo";

export const metadata: Metadata = {
  title: "Demo · Merge PDF (internal)",
  robots: { index: false, follow: false },
};

/**
 * Hidden Week 2 demonstration tool. NOT in the registry.
 * Excluded from indexing via metadata + robots.txt Disallow /dev/.
 * Exists to exercise the full upload → worker → download pipeline
 * and to be the test target for ToolPageLayout's JSON-LD.
 */
const DEMO_TOOL: Tool = {
  slug: "/dev/demo-merge",
  name: "Demo · Merge PDF",
  h1: "Merge PDFs (engine demo)",
  title: "Demo · Merge PDF",
  description:
    "Internal demonstration of the Week 2 tool engine — merge multiple PDFs into one, entirely in your browser.",
  shortDescription: "Internal Week 2 demo of the tool engine.",
  category: "edit",
  runtime: "client",
  status: "live",
  wave: 1,
  accepts: ["application/pdf"],
  primaryKeyword: "merge pdf demo",
  relatedSlugs: ["/fill-pdf", "/heic-to-pdf", "/sign-pdf"],
  howTo: [
    {
      name: "Drop PDFs",
      text: "Pick two or more PDF files from your device.",
    },
    {
      name: "Merge in your browser",
      text: "Click Merge — the Web Worker copies every page into one document.",
    },
    {
      name: "Download",
      text: "Click Download to save the merged PDF.",
    },
  ],
  faqs: [
    {
      q: "Are my files uploaded?",
      a: "No. Everything runs in your browser via a Web Worker. Nothing leaves your device.",
    },
    {
      q: "How many PDFs can I merge?",
      a: "Limited only by your device memory. We've tested 50 MB inputs without UI freeze.",
    },
    {
      q: "Will it preserve form fields?",
      a: "Page contents are copied as-is, including most annotations and form fields.",
    },
  ],
  privacyLine:
    "Files are processed entirely in your browser. Nothing is uploaded to any server.",
  longDescription: [],
};

export default function DemoMergePage() {
  return (
    <ToolPageLayout tool={DEMO_TOOL}>
      <DemoMergeShell />
    </ToolPageLayout>
  );
}
