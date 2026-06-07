"use client";

/**
 * Decode HEIC/HEIF to JPEG bytes. Browser-only (heic2any uses canvas).
 * Main thread, not worker — heic2any expects DOM `Blob` + `canvas`.
 */

export async function heicToJpeg(
  bytes: Uint8Array,
  quality = 0.92,
): Promise<Uint8Array> {
  const { default: heic2any } = await import("heic2any");
  const blob = new Blob([new Uint8Array(bytes)], { type: "image/heic" });
  const out = await heic2any({ blob, toType: "image/jpeg", quality });
  // heic2any returns Blob | Blob[]; for single-image HEIC it's a Blob.
  const single = Array.isArray(out) ? out[0]! : out;
  return new Uint8Array(await single.arrayBuffer());
}
