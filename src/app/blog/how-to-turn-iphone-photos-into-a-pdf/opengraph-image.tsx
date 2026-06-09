import { generateGuideOgImage, contentType, size } from "@/lib/og";
import { getGuide } from "@/lib/guides";

export { contentType, size };

export default function Image() {
  return generateGuideOgImage(getGuide("how-to-turn-iphone-photos-into-a-pdf")!);
}
