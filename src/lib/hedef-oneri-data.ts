export interface KonumOneri {
  ad: string;
  adres: string;
  lat: number;
  lng: number;
  mesafeKm?: number;
  placeId?: string;
}

export interface HedefOneriSecenekleri {
  limit?: number;
  excludeAdres?: string[];
  excludePlaceIds?: string[];
  queryOffset?: number;
}

export const SORUN_ARAMALARI: Record<string, string[]> = {
  ariza: ["oto sanayi", "oto servis", "yetkili servis"],
  lastik: ["lastikçi", "oto lastik", "mobil lastik"],
  aku: ["akü servisi", "oto elektrik", "oto sanayi"],
  yakit: ["benzin istasyonu", "oto sanayi"],
  kaza: ["oto sanayi", "oto kurtarma", "ekspertiz"],
  kilit: ["oto anahtar", "anahtarcı", "oto sanayi"],
  cekici: ["oto sanayi", "oto kurtarma", "çekici park"],
  diger: ["oto sanayi", "oto servis", "oto kurtarma"],
};

export function mesafeKmHaversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
