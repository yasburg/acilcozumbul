import type { Cekici } from "./types";

export type KrediBakiyeli = Pick<Cekici, "kredi" | "abonelikKredi">;

/** Kullanılabilir toplam (abonelik + satın alınan) */
export function cekiciToplamKredi(c: KrediBakiyeli): number {
  return Number(c.kredi || 0) + Number(c.abonelikKredi || 0);
}

/**
 * Önce abonelik kredisinden düşer (aylık, yenilemede sıfırlanır),
 * yetmezse satın alınan krediden düşer (kalıcı).
 */
export function cekiciKrediDus(c: KrediBakiyeli, tutar: number): void {
  let kalan = Number(tutar);
  if (kalan <= 0) return;

  const ab = Number(c.abonelikKredi || 0);
  if (ab > 0) {
    const dus = Math.min(ab, kalan);
    c.abonelikKredi = ab - dus;
    kalan -= dus;
  }
  if (kalan > 0) {
    c.kredi = Number(c.kredi || 0) - kalan;
  }
}

/** Abonelik yenileme: dönem hakkı paket(+bonus) miktarına eşitlenir; kullanılmayan abonelik/bonus yanar */
export function abonelikKrediSifirlaVeYukle(
  c: KrediBakiyeli,
  paketKredi: number
): void {
  c.abonelikKredi = Math.max(0, Number(paketKredi));
}

/** İlk / yeni abonelik ödemesi — dönem hakkını pakete ekler (satın alınan krediye dokunmaz) */
export function abonelikKrediYukle(c: KrediBakiyeli, paketKredi: number): void {
  c.abonelikKredi = Number(c.abonelikKredi || 0) + Math.max(0, Number(paketKredi));
}
