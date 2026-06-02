/** 1 kredi = 1 TL (SMS bildirimi başına) */
export const KREDI_BIRIM_FIYAT_TL = 1;

/** Satın alınabilir paketler (TL); minimum 100 TL */
export const KREDI_PAKET_TL_LISTESI = [100, 250, 500, 1000] as const;
export type KrediPaketTl = (typeof KREDI_PAKET_TL_LISTESI)[number];

export type KrediPaket = {
  /** Paket etiketi / liste fiyatı (TL) */
  tutarTL: KrediPaketTl;
  /** Hesaba eklenecek kredi */
  kredi: number;
  /** İndirim yüzdesi (ör. 1000 TL pakette 10) */
  indirimYuzde: number;
};

export const KREDI_PAKETLERI: readonly KrediPaket[] = [
  { tutarTL: 100, kredi: 100, indirimYuzde: 0 },
  { tutarTL: 250, kredi: 250, indirimYuzde: 0 },
  { tutarTL: 500, kredi: 500, indirimYuzde: 0 },
  { tutarTL: 1000, kredi: 1000, indirimYuzde: 10 },
];

export function krediPaketBul(tutarTL: number): KrediPaket | undefined {
  return KREDI_PAKETLERI.find((p) => p.tutarTL === tutarTL);
}

/** Ödenecek tutar (TL) — indirim sonrası */
export function krediPaketOdenecekTL(paket: KrediPaket): number {
  if (paket.indirimYuzde <= 0) return paket.tutarTL;
  return Math.round(paket.tutarTL * (1 - paket.indirimYuzde / 100));
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
