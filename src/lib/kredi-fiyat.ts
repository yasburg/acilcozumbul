/** 1 kredi = 1 TL tüketim (SMS bildirimi başına) */
export const KREDI_BIRIM_FIYAT_TL = 1;

/** Satın alınabilir paket tutarları (TL) */
export const KREDI_PAKET_TL_LISTESI = [499, 999, 1999] as const;
export type KrediPaketTl = (typeof KREDI_PAKET_TL_LISTESI)[number];

export type KrediPaketKaynak = "abonelik" | "kredi";

export type KrediPaket = {
  /** Paket etiketi / ödenen tutar (TL) */
  tutarTL: KrediPaketTl;
  /** Hesaba eklenecek toplam kredi */
  kredi: number;
  /** Bonus kredi (abonelikte; kredi satın almada 0) */
  bonusKredi: number;
  /** @deprecated Ödeme indirimi yok; her zaman 0 */
  indirimYuzde: number;
};

/** Tek seferlik kredi satın al — bonus yok */
export const KREDI_SATIN_AL_PAKETLERI: readonly KrediPaket[] = [
  { tutarTL: 499, kredi: 250, bonusKredi: 0, indirimYuzde: 0 },
  { tutarTL: 999, kredi: 750, bonusKredi: 0, indirimYuzde: 0 },
  { tutarTL: 1999, kredi: 2000, bonusKredi: 0, indirimYuzde: 0 },
];

/** Aylık abonelik — bonus 2./3. pakette */
export const ABONELIK_PAKETLERI: readonly KrediPaket[] = [
  { tutarTL: 499, kredi: 500, bonusKredi: 0, indirimYuzde: 0 },
  { tutarTL: 999, kredi: 1100, bonusKredi: 100, indirimYuzde: 0 },
  { tutarTL: 1999, kredi: 2400, bonusKredi: 400, indirimYuzde: 0 },
];

/** @deprecated Kredi satın al ile aynı; UI kaynak seçsin */
export const KREDI_PAKETLERI = KREDI_SATIN_AL_PAKETLERI;

export function krediPaketListesi(
  kaynak: KrediPaketKaynak
): readonly KrediPaket[] {
  return kaynak === "abonelik" ? ABONELIK_PAKETLERI : KREDI_SATIN_AL_PAKETLERI;
}

export function krediPaketBul(
  tutarTL: number,
  kaynak: KrediPaketKaynak = "kredi"
): KrediPaket | undefined {
  return krediPaketListesi(kaynak).find((p) => p.tutarTL === tutarTL);
}

/** Ödenecek tutar — her zaman liste fiyatı (ödeme indirimi yok) */
export function krediPaketOdenecekTL(paket: KrediPaket): number {
  return paket.tutarTL;
}

/** Garanti sanal POS tutarı (kuruş) — ödenecek TL üzerinden */
export function tlTutarKurus(tutarTL: number): number {
  return Math.round(tutarTL * 100);
}

/** @deprecated Paket dışı; SMS birim fiyatı için */
export function krediTutarTL(krediAdet: number): number {
  return krediAdet * KREDI_BIRIM_FIYAT_TL;
}

/** @deprecated Paket ödemelerinde tlTutarKurus(odenecekTL) kullanın */
export function krediTutarKurus(krediAdet: number): number {
  return tlTutarKurus(krediTutarTL(krediAdet));
}
