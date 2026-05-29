import { getTalepler } from "./db";
import type { Teklif } from "./types";

export interface CekiciPuanOzeti {
  /** Müşteri tercih yüzdesi (0–100); yeterli veri yoksa null */
  tercihYuzde: number | null;
  /** 1–5 arası tercih puanı (ör. %90 → 4.5) */
  tercihPuani: number | null;
  /** Fiyat garanti yüzdesi (0–100) */
  fiyatGarantiYuzde: number;
  /** 1–5 arası fiyat garanti puanı */
  fiyatGarantiPuani: number;
  kazanilanTeklif: number;
  anlasilanIs: number;
  toplamTeklif: number;
  fiyatDegistirenTeklif: number;
}

function normalizeTeklif(t: Teklif): Teklif {
  const ilk = t.ilkFiyat ?? t.fiyat;
  const degisti =
    t.fiyatDegisti === true || (t.ilkFiyat != null && t.fiyat !== t.ilkFiyat);
  return { ...t, ilkFiyat: ilk, fiyatDegisti: degisti };
}

/** Tercih yüzdesinden 1–5 puan (doğrusal: %100 = 5.0, %90 = 4.5) */
export function tercihPuaniHesapla(tercihYuzde: number): number {
  const ham = (tercihYuzde / 100) * 5;
  return Math.round(ham * 10) / 10;
}

/** Fiyat garanti yüzdesinden 1–5 puan */
export function fiyatGarantiPuaniHesapla(yuzde: number): number {
  const ham = (yuzde / 100) * 5;
  return Math.round(ham * 10) / 10;
}

export async function cekiciPuanOzeti(cekiciId: string): Promise<CekiciPuanOzeti> {
  const talepler = await getTalepler();

  let kazanilanTeklif = 0;
  let anlasilanIs = 0;
  let toplamTeklif = 0;
  let fiyatDegistirenTeklif = 0;

  for (const talep of talepler) {
    for (const raw of talep.teklifler ?? []) {
      if (raw.cekiciId !== cekiciId) continue;
      const t = normalizeTeklif(raw);
      toplamTeklif += 1;
      if (t.fiyatDegisti) fiyatDegistirenTeklif += 1;
      if (t.durum === "kazandi") kazanilanTeklif += 1;
    }
    if (talep.durum === "anlaşıldı" && talep.kazananCekiciId === cekiciId) {
      anlasilanIs += 1;
    }
  }

  const tercihYuzde =
    kazanilanTeklif > 0
      ? Math.round((anlasilanIs / kazanilanTeklif) * 100)
      : null;

  const tercihPuani =
    tercihYuzde != null ? tercihPuaniHesapla(tercihYuzde) : null;

  const fiyatGarantiYuzde =
    toplamTeklif > 0
      ? Math.round(
          ((toplamTeklif - fiyatDegistirenTeklif) / toplamTeklif) * 100
        )
      : 100;

  const fiyatGarantiPuani = fiyatGarantiPuaniHesapla(fiyatGarantiYuzde);

  return {
    tercihYuzde,
    tercihPuani,
    fiyatGarantiYuzde,
    fiyatGarantiPuani,
    kazanilanTeklif,
    anlasilanIs,
    toplamTeklif,
    fiyatDegistirenTeklif,
  };
}

export function teklifFiyatDegistiMi(teklif: Teklif): boolean {
  const t = normalizeTeklif(teklif);
  return t.fiyatDegisti === true;
}
