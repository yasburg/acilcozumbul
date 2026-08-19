import { orderIdTemizle } from "./garanti/payment";
import { istanbulGunAnahtari } from "./istanbul-tarih";
import type { AbonelikIslemTip } from "./types";

export type PanelGelirKalem = {
  /** İşlem adedi */
  adet: number;
  /** Toplam tahsilat (TL) */
  tutarTl: number;
  /** Toplam yüklenen kredi */
  kredi: number;
  /** Paket TL → adet (ör. 999 → 3) */
  paketDagilim: { paketTl: number; adet: number }[];
};

export type PanelGelirOzet = {
  /** Europe/Istanbul YYYY-MM */
  ay: string;
  /** Aylık abonelik: yeni + yenileme (bu ay) */
  aylikPaketler: PanelGelirKalem;
  /** Tek seferlik kredi satın al (bu ay; abonelik ilk ödemesi hariç) */
  satinAlinanKrediler: PanelGelirKalem;
};

export type AbonelikIslemOzetSatir = {
  tip: AbonelikIslemTip | string;
  tutarTl: number;
  kredi: number;
  garantiOrderId?: string;
  createdAt: string;
};

export type KrediOdemeOzetSatir = {
  id: string;
  miktar: number;
  tutar: number;
  paketTl: number;
  demoOdeme: boolean;
  olusturulma: string;
};

/** Europe/Istanbul takvim ayı (YYYY-MM) */
export function istanbulAyAnahtari(d: Date = new Date()): string {
  return istanbulGunAnahtari(d).slice(0, 7);
}

/** Ayın ilk anı (Europe/Istanbul, +03) */
export function istanbulAyBaslangicIso(d: Date = new Date()): string {
  return `${istanbulAyAnahtari(d)}-01T00:00:00+03:00`;
}

function paketDagilimHesapla(
  paketTlListesi: number[]
): { paketTl: number; adet: number }[] {
  const map = new Map<number, number>();
  for (const p of paketTlListesi) {
    const key = Math.round(Number(p));
    if (!Number.isFinite(key) || key <= 0) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([paketTl, adet]) => ({ paketTl, adet }));
}

/**
 * Panel özet: bu ay (Europe/Istanbul) aylık paket tahsilatı + tek seferlik kredi.
 * Abonelik ilk ödemesi hem abonelik_islem hem kredi_odemeler’de olabilir; krediden çıkarılır.
 */
export function panelGelirOzetHesapla(
  abonelikIslemleri: AbonelikIslemOzetSatir[],
  krediOdemeleri: KrediOdemeOzetSatir[],
  simdi: Date = new Date()
): PanelGelirOzet {
  const ay = istanbulAyAnahtari(simdi);
  const ayBas = Date.parse(istanbulAyBaslangicIso(simdi));

  const paketTahsilat = abonelikIslemleri.filter((i) => {
    if (i.tip !== "created" && i.tip !== "renewal") return false;
    const t = Date.parse(i.createdAt);
    return Number.isFinite(t) && t >= ayBas;
  });

  const abonelikOrderIds = new Set(
    abonelikIslemleri
      .filter((i) => i.tip === "created" && i.garantiOrderId)
      .map((i) => i.garantiOrderId as string)
  );

  const krediTahsilat = krediOdemeleri.filter((k) => {
    if (k.demoOdeme) return false;
    const t = Date.parse(k.olusturulma);
    if (!Number.isFinite(t) || t < ayBas) return false;
    const temiz = orderIdTemizle(k.id);
    if (abonelikOrderIds.has(temiz)) return false;
    if (abonelikOrderIds.has(k.id)) return false;
    return true;
  });

  return {
    ay,
    aylikPaketler: {
      adet: paketTahsilat.length,
      tutarTl: paketTahsilat.reduce((s, i) => s + Number(i.tutarTl || 0), 0),
      kredi: paketTahsilat.reduce((s, i) => s + Number(i.kredi || 0), 0),
      paketDagilim: paketDagilimHesapla(
        paketTahsilat.map((i) => Number(i.tutarTl || 0))
      ),
    },
    satinAlinanKrediler: {
      adet: krediTahsilat.length,
      tutarTl: krediTahsilat.reduce((s, k) => s + Number(k.tutar || 0), 0),
      kredi: krediTahsilat.reduce((s, k) => s + Number(k.miktar || 0), 0),
      paketDagilim: paketDagilimHesapla(
        krediTahsilat.map((k) => Number(k.paketTl || 0))
      ),
    },
  };
}
