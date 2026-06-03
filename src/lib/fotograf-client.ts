"use client";

const MAX_KENAR = 1280;
const JPEG_KALITE = 0.82;

/** Dosyayı sıkıştırıp data URL döndürür (max ~500KB hedef) */
export async function fotografSikistir(dosya: File): Promise<string> {
  if (!dosya.type.startsWith("image/")) {
    throw new Error("Yalnızca fotoğraf yükleyebilirsiniz.");
  }
  if (dosya.size > 12 * 1024 * 1024) {
    throw new Error("Fotoğraf en fazla 12 MB olabilir.");
  }

  const bitmap = await createImageBitmap(dosya);
  const oran = Math.min(1, MAX_KENAR / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * oran);
  const h = Math.round(bitmap.height * oran);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Fotoğraf işlenemedi.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_KALITE);
}
