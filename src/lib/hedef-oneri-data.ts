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

export { mesafeKmHaversine } from "./geo";
