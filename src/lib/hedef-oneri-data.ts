export interface KonumOneri {
  ad: string;
  adres: string;
  lat: number;
  lng: number;
  mesafeKm?: number;
  placeId?: string;
  /** Google puanı (1–5) */
  puan?: number;
  /** Değerlendirme sayısı */
  puanSayisi?: number;
  /** Bekleme ekranı grupları */
  kategori?: "oto_tamir" | "oto_sanayi";
  /** Grup içi sıra (harita etiketi) */
  etiketNo?: number;
}

export interface HedefOneriSecenekleri {
  limit?: number;
  excludeAdres?: string[];
  excludePlaceIds?: string[];
  queryOffset?: number;
  /** İlçe / semt — Oto Tamir aramasını semte bağlar */
  semt?: string;
  /** Şehir — Maps tarzı «Oto Tamir {semt} {şehir}» sorgusu */
  il?: string;
}

export const SORUN_ARAMALARI: Record<string, string[]> = {
  ariza: ["oto sanayi", "oto servis", "yetkili servis"],
  lastik: ["lastikçi", "oto lastik", "mobil lastik"],
  aku: ["akü servisi", "oto elektrik", "oto sanayi"],
  yakit: ["benzin istasyonu", "oto sanayi"],
  kaza: ["oto sanayi", "oto kurtarma", "ekspertiz"],
  kilit: ["oto anahtar", "anahtarcı", "oto sanayi"],
  cekici: ["oto sanayi", "oto kurtarma", "çekici park"],
  "arac-tasima": ["oto sanayi", "çekici park", "oto kurtarma"],
  diger: ["oto sanayi", "oto servis", "oto kurtarma"],
};

export const SERVIS_ONERI_GRUPLARI = [
  {
    kategori: "oto_tamir" as const,
    sorgu: "Oto Tamir",
    limit: 5,
    /** Semt + şehir metin araması; bias yarıçapı */
    yaricapM: 10000,
  },
  {
    kategori: "oto_sanayi" as const,
    sorgu: "oto sanayi",
    limit: 3,
    yaricapM: 12000,
  },
];

/** Google MapsScraper ile aynı format: `oto tamir Semt Şehir Türkiye` */
export function otoTamirAramaSorgusu(opts: {
  semt?: string | null;
  il?: string | null;
}): string {
  const parcalar = ["oto tamir"];
  const semt = opts.semt?.trim();
  const il = opts.il?.trim();
  if (semt) parcalar.push(semt);
  if (
    il &&
    (!semt ||
      semt.toLocaleLowerCase("tr-TR") !== il.toLocaleLowerCase("tr-TR"))
  ) {
    parcalar.push(il);
  }
  if (il || semt) parcalar.push("Türkiye");
  return parcalar.join(" ");
}

export { mesafeKmHaversine } from "./geo";
