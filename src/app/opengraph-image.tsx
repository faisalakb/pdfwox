import { generateDefaultOgImage, contentType, size } from "@/lib/og";
import { SITE } from "@/lib/site";

export { contentType, size };

export default function Image() {
  return generateDefaultOgImage(
    SITE.name,
    "Free PDF tools that run in your browser. No uploads, no signup.",
    "Free PDF Tools",
  );
}
