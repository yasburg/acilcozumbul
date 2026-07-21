import turkiyeIlKoordinat from "@/data/turkiye-il-koordinat.json";

export type IlKoordinat = { lon: number; lat: number };

export const TURKIYE_IL_KOORDINAT: Record<string, IlKoordinat> =
  turkiyeIlKoordinat;

/** SVG harita projeksiyon sınırları (Türkiye) */
export const TURKIYE_HARITA = {
  lonMin: 25.4,
  lonMax: 45.0,
  latMin: 35.7,
  latMax: 42.4,
  width: 960,
  height: 460,
} as const;

export function ilKoordinatBul(sehir: string): IlKoordinat | null {
  const s = sehir.trim();
  if (!s) return null;
  if (TURKIYE_IL_KOORDINAT[s]) return TURKIYE_IL_KOORDINAT[s];
  const bulunan = Object.keys(TURKIYE_IL_KOORDINAT).find(
    (il) => il.localeCompare(s, "tr", { sensitivity: "accent" }) === 0
  );
  return bulunan ? TURKIYE_IL_KOORDINAT[bulunan] : null;
}

export function turkiyeProjeksiyon(
  lon: number,
  lat: number
): { x: number; y: number } {
  const { lonMin, lonMax, latMin, latMax, width, height } = TURKIYE_HARITA;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * width;
  const y = ((latMax - lat) / (latMax - latMin)) * height;
  return { x, y };
}

/**
 * Kayıt adedine göre daire yarıçapı — log1p ölçeği
 * (büyük farklarda aşırı büyümez).
 */
export function haritaYaricapLog(
  adet: number,
  maxAdet: number,
  rMin = 14,
  rMax = 48
): number {
  if (adet <= 0) return rMin;
  const tavan = Math.max(maxAdet, 1);
  const t = Math.log1p(adet) / Math.log1p(tavan);
  return rMin + t * (rMax - rMin);
}
