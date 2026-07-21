/**
 * Netgsm toplu SMS (başlıklı, dil=TR) karakter hesabı.
 * @see https://bilgibankasi.netgsm.com.tr/bilgi-bankasi/karakter-mesaj-boyu-hesaplama/
 *
 * 1 SMS = 150 birim (Türkçe destekli).
 * «ç ğ ı ş Ğ İ Ş» 2 birim; diğer karakterler 1 birim.
 */

const NETGSM_TR_CIFTE = new Set([
  "ç",
  "ğ",
  "ı",
  "ş",
  "Ç",
  "Ğ",
  "İ",
  "Ş",
]);

/** 1 SMS (Türkçe) için birim limiti */
export const NETGSM_TOPLU_SMS_BIRIM = 150;

/**
 * Uzun SMS üst sınırı (3 parça). Panel toplu gönderimde maliyet kontrolü.
 */
export const NETGSM_TOPLU_SMS_MAX_BIRIM = NETGSM_TOPLU_SMS_BIRIM * 3;

export function netgsmSmsBirimHesapla(mesaj: string): number {
  let birim = 0;
  for (const ch of mesaj) {
    birim += NETGSM_TR_CIFTE.has(ch) ? 2 : 1;
  }
  return birim;
}

export function netgsmSmsParcaSayisi(birim: number): number {
  if (birim <= 0) return 0;
  return Math.ceil(birim / NETGSM_TOPLU_SMS_BIRIM);
}

export function netgsmSmsMesajGecerliMi(mesaj: string): {
  gecerli: boolean;
  birim: number;
  parca: number;
  kalan: number;
  hata?: string;
} {
  const birim = netgsmSmsBirimHesapla(mesaj);
  const parca = netgsmSmsParcaSayisi(birim);
  const kalan = Math.max(0, NETGSM_TOPLU_SMS_MAX_BIRIM - birim);
  if (!mesaj.trim()) {
    return { gecerli: false, birim, parca, kalan, hata: "Mesaj boş olamaz." };
  }
  if (birim > NETGSM_TOPLU_SMS_MAX_BIRIM) {
    return {
      gecerli: false,
      birim,
      parca,
      kalan: 0,
      hata: `Mesaj çok uzun (max ${NETGSM_TOPLU_SMS_MAX_BIRIM} birim ≈ ${NETGSM_TOPLU_SMS_MAX_BIRIM / NETGSM_TOPLU_SMS_BIRIM} SMS).`,
    };
  }
  return { gecerli: true, birim, parca, kalan };
}
