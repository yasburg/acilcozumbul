import { getSupabaseAdmin } from "./supabase/admin";
import type { Talep } from "./types";

export type FiyatRehberi = { alt: number; ust: number; medyan: number; ornekSayisi: number };

function medyan(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function yuzdelik(sorted: number[], percentile: number): number {
  const i = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * percentile)));
  return sorted[i];
}

function yuvarla(value: number): number {
  return Math.round(value / 50) * 50;
}

/** Saf hesap; P2 deneyinin güvenlik eşiğini test etmek için export edilir. */
export function fiyatRehberiHesapla(fiyatlar: number[]): FiyatRehberi | null {
  const sorted = fiyatlar.filter((f) => Number.isFinite(f) && f >= 100).sort((a, b) => a - b);
  if (sorted.length < 10) return null;
  return {
    alt: yuvarla(yuzdelik(sorted, 0.25)),
    ust: yuvarla(yuzdelik(sorted, 0.75)),
    medyan: yuvarla(medyan(sorted)),
    ornekSayisi: sorted.length,
  };
}

/** Benzer şehir+sorun tipi taleplerindeki seçilmiş teklifler; müşteri veya PII sorgulanmaz. */
export async function benzerTalepFiyatRehberi(talep: Talep): Promise<FiyatRehberi | null> {
  if (!talep.konumIl || !talep.sorunTipi) return null;
  const since = new Date(Date.now() - 90 * 24 * 60 * 60_000).toISOString();
  const { data: requestRows, error: requestError } = await getSupabaseAdmin().from("talepler")
    .select("id").eq("konum_il", talep.konumIl).eq("sorun_tipi", talep.sorunTipi)
    .gte("olusturulma", since).neq("id", talep.id).limit(300);
  if (requestError) throw requestError;
  const ids = (requestRows ?? []).map((r: { id: string }) => r.id);
  if (ids.length === 0) return null;
  const { data: bidRows, error: bidError } = await getSupabaseAdmin().from("teklifler")
    .select("fiyat").in("talep_id", ids).eq("durum", "kazandi").limit(500);
  if (bidError) throw bidError;
  return fiyatRehberiHesapla((bidRows ?? []).map((r: { fiyat: number }) => Number(r.fiyat)));
}
