import {
  getCekiciPuanOzetRow,
  getCekiciPuanOzetRows,
  refreshCekiciPuanOzet,
} from "./puan-ozet-db";
import { cekiciHizmetPuani, gorunurTercihPuani } from "./memnuniyet";
import { countTekliflerByCekici } from "./teklif-db";
import { getSupabaseAdmin } from "./supabase/admin";
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
  /** Müşteri memnuniyet ortalaması (1–5) */
  hizmetPuani: number | null;
  hizmetDegerlendirmeAdet: number;
  /** Müşteriye gösterilen tercih puanı (içeride hizmet puanıyla harmanlanır) */
  gorunurTercihPuani: number | null;
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

function ozetFromCounts(
  toplamTeklif: number,
  kazanilanTeklif: number,
  anlasilanIs: number,
  fiyatDegistirenTeklif: number,
  hizmet: { ortalama: number | null; adet: number }
): CekiciPuanOzeti {
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
  const gorunurTercih = gorunurTercihPuani(tercihPuani, hizmet.ortalama);

  return {
    tercihYuzde,
    tercihPuani,
    fiyatGarantiYuzde,
    fiyatGarantiPuani,
    kazanilanTeklif,
    anlasilanIs,
    toplamTeklif,
    fiyatDegistirenTeklif,
    hizmetPuani: hizmet.ortalama,
    hizmetDegerlendirmeAdet: hizmet.adet,
    gorunurTercihPuani: gorunurTercih,
  };
}

async function anlasilanIsSay(cekiciId: string): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*", { count: "exact", head: true })
    .eq("kazanan_cekici_id", cekiciId)
    .eq("durum", "anlaşıldı");
  if (error) throw error;
  return count ?? 0;
}

async function computePuanFromTables(
  cekiciId: string,
  hizmet: { ortalama: number | null; adet: number }
): Promise<CekiciPuanOzeti> {
  const counts = await countTekliflerByCekici(cekiciId);
  const anlasilanIs = await anlasilanIsSay(cekiciId);
  return ozetFromCounts(
    counts.toplam,
    counts.kazanilan,
    anlasilanIs,
    counts.fiyatDegistiren,
    hizmet
  );
}

export async function cekiciPuanOzeti(cekiciId: string): Promise<CekiciPuanOzeti> {
  const hizmet = await cekiciHizmetPuani(cekiciId);

  try {
    const cached = await getCekiciPuanOzetRow(cekiciId);
    if (cached) {
      return ozetFromCounts(
        cached.toplam_teklif,
        cached.kazanilan,
        cached.anlasilan,
        cached.fiyat_degistiren,
        hizmet
      );
    }
    const ozet = await computePuanFromTables(cekiciId, hizmet);
    await refreshCekiciPuanOzet(cekiciId).catch(() => {});
    return ozet;
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code === "42P01" || code === "PGRST205") {
      return ozetFromCounts(0, 0, 0, 0, hizmet);
    }
    throw e;
  }
}

/** N+1 önleme — birden fazla çekici için batch puan */
export async function cekiciPuanOzetleri(
  cekiciIds: string[]
): Promise<Map<string, CekiciPuanOzeti>> {
  const unique = [...new Set(cekiciIds.filter(Boolean))];
  const map = new Map<string, CekiciPuanOzeti>();
  if (unique.length === 0) return map;

  const [cacheMap, hizmetEntries] = await Promise.all([
    getCekiciPuanOzetRows(unique).catch(() => new Map()),
    Promise.all(
      unique.map(async (id) => [id, await cekiciHizmetPuani(id)] as const)
    ),
  ]);
  const hizmetMap = new Map(hizmetEntries);

  await Promise.all(
    unique.map(async (id) => {
      const hizmet = hizmetMap.get(id) ?? { ortalama: null, adet: 0 };
      const cached = cacheMap.get(id);
      if (cached) {
        map.set(
          id,
          ozetFromCounts(
            cached.toplam_teklif,
            cached.kazanilan,
            cached.anlasilan,
            cached.fiyat_degistiren,
            hizmet
          )
        );
        return;
      }
      try {
        map.set(id, await computePuanFromTables(id, hizmet));
        await refreshCekiciPuanOzet(id).catch(() => {});
      } catch {
        map.set(id, ozetFromCounts(0, 0, 0, 0, hizmet));
      }
    })
  );

  return map;
}

export function teklifFiyatDegistiMi(teklif: Teklif): boolean {
  const t = normalizeTeklif(teklif);
  return t.fiyatDegisti === true;
}
