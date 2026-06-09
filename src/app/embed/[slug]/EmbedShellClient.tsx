"use client";

import nextDynamic from "next/dynamic";
import type { ImagesToPdfShellProps } from "@/components/ImagesToPdfShell";

const FillShell = nextDynamic(
  () =>
    import("@/app/fill-pdf/FillShell").then((m) => ({
      default: m.FillShell,
    })),
  { ssr: false },
);
const CreateShell = nextDynamic(
  () =>
    import("@/app/create-fillable-pdf/CreateShell").then((m) => ({
      default: m.CreateShell,
    })),
  { ssr: false },
);
const SignShell = nextDynamic(
  () =>
    import("@/app/sign-pdf/SignShell").then((m) => ({
      default: m.SignShell,
    })),
  { ssr: false },
);
const AnnotateShell = nextDynamic(
  () =>
    import("@/app/annotate-pdf/AnnotateShell").then((m) => ({
      default: m.AnnotateShell,
    })),
  { ssr: false },
);
const RedactShell = nextDynamic(
  () =>
    import("@/app/redact-pdf/RedactShell").then((m) => ({
      default: m.RedactShell,
    })),
  { ssr: false },
);
const ProtectShell = nextDynamic(
  () =>
    import("@/app/protect-pdf/ProtectShell").then((m) => ({
      default: m.ProtectShell,
    })),
  { ssr: false },
);
const UnlockShell = nextDynamic(
  () =>
    import("@/app/unlock-pdf/UnlockShell").then((m) => ({
      default: m.UnlockShell,
    })),
  { ssr: false },
);
const OcrPdfShell = nextDynamic(
  () =>
    import("@/app/ocr-pdf/OcrPdfShell").then((m) => ({
      default: m.OcrPdfShell,
    })),
  { ssr: false },
);
const PdfToTextShell = nextDynamic(
  () =>
    import("@/app/pdf-to-text/PdfToTextShell").then((m) => ({
      default: m.PdfToTextShell,
    })),
  { ssr: false },
);
const AddWatermarkShell = nextDynamic(
  () =>
    import("@/app/add-watermark-to-pdf/AddWatermarkShell").then((m) => ({
      default: m.AddWatermarkShell,
    })),
  { ssr: false },
);
const RemoveWatermarkShell = nextDynamic(
  () =>
    import("@/app/remove-watermark-from-pdf/RemoveWatermarkShell").then(
      (m) => ({ default: m.RemoveWatermarkShell }),
    ),
  { ssr: false },
);
const ImageShell = nextDynamic<ImagesToPdfShellProps>(
  () =>
    import("@/components/ImagesToPdfShell").then((m) => ({
      default: m.ImagesToPdfShell,
    })),
  { ssr: false },
);

const shellComponents: Record<string, React.ComponentType> = {
  "/fill-pdf": FillShell,
  "/create-fillable-pdf": CreateShell,
  "/sign-pdf": SignShell,
  "/annotate-pdf": AnnotateShell,
  "/redact-pdf": RedactShell,
  "/protect-pdf": ProtectShell,
  "/unlock-pdf": UnlockShell,
  "/ocr-pdf": OcrPdfShell,
  "/pdf-to-text": PdfToTextShell,
  "/add-watermark-to-pdf": AddWatermarkShell,
  "/remove-watermark-from-pdf": RemoveWatermarkShell,
};

const imageMimeMap: Record<string, string[]> = {
  "/heic-to-pdf": ["image/heic", "image/heif"],
  "/jpg-to-pdf": ["image/jpeg"],
  "/png-to-pdf": ["image/png"],
  "/webp-to-pdf": ["image/webp"],
  "/bmp-to-pdf": ["image/bmp"],
  "/gif-to-pdf": ["image/gif"],
};

export function EmbedShellClient({
  toolSlug,
  slug,
  toolName,
}: {
  toolSlug: string;
  slug: string;
  toolName: string;
}) {
  const DedicatedShell = shellComponents[toolSlug];
  const imageMimes = imageMimeMap[toolSlug];

  if (DedicatedShell) return <DedicatedShell />;

  if (imageMimes) {
    return (
      <ImageShell
        toolSlug={toolSlug}
        accepts={imageMimes}
        enableHeic={toolSlug === "/heic-to-pdf"}
        enableCanvasDecode={["/webp-to-pdf", "/bmp-to-pdf", "/gif-to-pdf"].includes(toolSlug)}
        defaultFilename={`${slug}.pdf`}
        dropzoneLabel={`Drop your ${toolName.replace(" to PDF", "")} files`}
        dropzoneHint="Files stay on your device."
      />
    );
  }

  return null;
}
