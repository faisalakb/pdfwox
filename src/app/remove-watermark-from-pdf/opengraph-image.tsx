import { generateToolOgImage, contentType, size } from "@/lib/og";
import { getTool } from "@/lib/tools";

export { contentType, size };

export default function Image() {
  return generateToolOgImage(getTool("/remove-watermark-from-pdf")!);
}
