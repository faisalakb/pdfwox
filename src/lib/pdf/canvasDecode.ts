"use client";

/**
 * Decode any image the browser can render natively (WebP, BMP, GIF, etc.)
 * to JPEG bytes, going via an HTMLImageElement and canvas.
 *
 * Used by the long-tail image-to-PDF pages (webp, bmp, gif) and any
 * other tool that needs a JPEG round-trip for an unsupported source.
 */
export async function decodeToJpeg(
  bytes: Uint8Array,
  mime: string,
  quality = 0.92,
): Promise<Uint8Array> {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decodeToJpeg: image load failed"));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("decodeToJpeg: no 2d context");
    // White background for formats with transparency.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const out = await new Promise<Blob>((res, rej) =>
      canvas.toBlob(
        (b) => (b ? res(b) : rej(new Error("decodeToJpeg: toBlob null"))),
        "image/jpeg",
        quality,
      ),
    );
    return new Uint8Array(await out.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}
