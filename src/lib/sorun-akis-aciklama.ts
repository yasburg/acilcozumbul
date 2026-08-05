import type { SorunTipiId } from "./sorun-tipleri";
import { sorunHedefKonumGerekliMi, talepSorunTipi } from "./sorun-tipleri";

export type SorunAkisAdim = {
  ikon: string;
  kisa: string;
};

export type SorunAkisAciklama = {
  /** Ne tür hizmet alınır */
  hizmet: string;
  adimlar: SorunAkisAdim[];
};

const YERINDE_ADIMLAR: SorunAkisAdim[] = [
  { ikon: "📍", kisa: "Konum" },
  { ikon: "📝", kisa: "Detay" },
  { ikon: "💬", kisa: "Teklifler" },
  { ikon: "✅", kisa: "Seç" },
];

const CEKICI_ADIMLAR: SorunAkisAdim[] = [
  { ikon: "📍", kisa: "Konum" },
  { ikon: "📝", kisa: "Detay" },
  { ikon: "🏁", kisa: "Hedef" },
  { ikon: "💬", kisa: "Teklifler" },
  { ikon: "✅", kisa: "Seç" },
];

export const SORUN_AKIS_ACIKLAMA: Record<SorunTipiId, SorunAkisAciklama> = {
  ariza: {
    hizmet:
      "Çekici aracınızı bulunduğunuz yerden alır; tamir servisi, oto sanayi veya seçtiğiniz adrese götürür.",
    adimlar: CEKICI_ADIMLAR,
  },
  lastik: {
    hizmet:
      "Lastikçi yerinde lastiğinizi tamir eder veya gerekirse değiştirir.",
    adimlar: YERINDE_ADIMLAR,
  },
  aku: {
    hizmet:
      "Yol yardım ekibi akünüze takviye (şarj) yapar veya akü değişimi sağlar.",
    adimlar: YERINDE_ADIMLAR,
  },
  yakit: {
    hizmet:
      "Yakıt desteği — bulunduğunuz yere en az 1 litre yakıt getirilir.",
    adimlar: YERINDE_ADIMLAR,
  },
  kaza: {
    hizmet:
      "Kaza sonrası çekici ve kurtarma; aracınız seçtiğiniz servise veya adrese taşınır.",
    adimlar: CEKICI_ADIMLAR,
  },
  kilit: {
    hizmet:
      "Anahtarcı aracınızın kilidini açar; anahtar veya kilit sorunlarında yerinde müdahale.",
    adimlar: YERINDE_ADIMLAR,
  },
  cekici: {
    hizmet:
      "Çekici aracınızı kurtarır ve seçtiğiniz hedef adrese güvenle taşır.",
    adimlar: CEKICI_ADIMLAR,
  },
  "arac-tasima": {
    hizmet:
      "Aracınızı bulunduğunuz yerden alır; şehirler arası veya seçtiğiniz adrese taşır.",
    adimlar: CEKICI_ADIMLAR,
  },
  diger: {
    hizmet:
      "Açıklamanıza uygun yol yardım veya çekici; gerekirse hedef adres de seçilir.",
    adimlar: CEKICI_ADIMLAR,
  },
};

export function sorunAkisAciklama(
  sorunTipi?: string
): SorunAkisAciklama | null {
  if (!sorunTipi?.trim()) return null;
  const id = talepSorunTipi({ sorunTipi: sorunTipi });
  return SORUN_AKIS_ACIKLAMA[id] ?? null;
}

/** Adım sayısı — hedef adımı atlanan tiplerde 4, diğerlerinde 5 */
export function sorunAkisAdimSayisi(sorunTipi?: string): number {
  const aciklama = sorunAkisAciklama(sorunTipi);
  if (aciklama) return aciklama.adimlar.length;
  return sorunHedefKonumGerekliMi(sorunTipi) ? 5 : 4;
}
