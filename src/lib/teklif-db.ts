import { getSupabaseAdmin } from "./supabase/admin";
import type { Teklif, TeklifDurumu } from "./types";

export type TeklifRow = {
  id: string;
  talep_id: string;
  cekici_id: string;
  cekici_ad: string;
  fiyat: number;
  ilk_fiyat: number | null;
  fiyat_degisti: boolean;
  fiyat_guncelleme_tarihi: string | null;
  tahmini_sure_dk: number;
  mesaj: string | null;
  tarih: string;
  durum: string;
};

export function teklifFromRow(r: TeklifRow): Teklif {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    cekiciAd: r.cekici_ad,
    fiyat: Number(r.fiyat),
    ilkFiyat: r.ilk_fiyat != null ? Number(r.ilk_fiyat) : undefined,
    fiyatDegisti: Boolean(r.fiyat_degisti),
    fiyatGuncellemeTarihi: r.fiyat_guncelleme_tarihi ?? undefined,
    tahminiSureDk: Number(r.tahmini_sure_dk),
    mesaj: r.mesaj ?? undefined,
    tarih: r.tarih,
    durum: r.durum as TeklifDurumu,
  };
}

export function teklifToRow(talepId: string, t: Teklif): TeklifRow {
  return {
    id: t.id,
    talep_id: talepId,
    cekici_id: t.cekiciId,
    cekici_ad: t.cekiciAd,
    fiyat: t.fiyat,
    ilk_fiyat: t.ilkFiyat ?? t.fiyat,
    fiyat_degisti: Boolean(t.fiyatDegisti),
    fiyat_guncelleme_tarihi: t.fiyatGuncellemeTarihi ?? null,
    tahmini_sure_dk: t.tahminiSureDk,
    mesaj: t.mesaj ?? null,
    tarih: t.tarih,
    durum: t.durum,
  };
}

export async function listTekliflerByTalep(talepId: string): Promise<Teklif[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("teklifler")
    .select("*")
    .eq("talep_id", talepId)
    .order("tarih", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as TeklifRow[]).map(teklifFromRow);
}

export async function listTekliflerByCekici(cekiciId: string): Promise<Teklif[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("teklifler")
    .select("*")
    .eq("cekici_id", cekiciId);
  if (error) throw error;
  return ((data ?? []) as TeklifRow[]).map(teklifFromRow);
}

export async function listTekliflerByTalepIds(
  talepIds: string[]
): Promise<Map<string, Teklif[]>> {
  const map = new Map<string, Teklif[]>();
  if (talepIds.length === 0) return map;
  const { data, error } = await getSupabaseAdmin()
    .from("teklifler")
    .select("*")
    .in("talep_id", talepIds);
  if (error) throw error;
  for (const row of (data ?? []) as TeklifRow[]) {
    const list = map.get(row.talep_id) ?? [];
    list.push(teklifFromRow(row));
    map.set(row.talep_id, list);
  }
  return map;
}

/** Yeni teklif. Aynı talep+çekici varsa false döner (yarış güvenliği). */
export async function insertTeklif(
  talepId: string,
  teklif: Teklif
): Promise<boolean> {
  const { error } = await getSupabaseAdmin()
    .from("teklifler")
    .insert(teklifToRow(talepId, teklif));
  if (error) {
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}

export async function upsertTeklif(
  talepId: string,
  teklif: Teklif
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("teklifler")
    .upsert(teklifToRow(talepId, teklif), { onConflict: "id" });
  if (error) throw error;
}

export async function syncTekliflerForTalep(
  talepId: string,
  teklifler: Teklif[]
): Promise<void> {
  if (teklifler.length === 0) return;
  const { error } = await getSupabaseAdmin()
    .from("teklifler")
    .upsert(
      teklifler.map((t) => teklifToRow(talepId, t)),
      { onConflict: "id" }
    );
  if (error) throw error;
}

export async function updateTeklifDurum(
  teklifId: string,
  durum: TeklifDurumu
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("teklifler")
    .update({ durum })
    .eq("id", teklifId);
  if (error) throw error;
}

export async function setKaybedenTeklifler(
  talepId: string,
  kazananTeklifId: string
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("teklifler")
    .update({ durum: "kaybetti" })
    .eq("talep_id", talepId)
    .eq("durum", "aktif")
    .neq("id", kazananTeklifId);
  if (error) throw error;
}

export async function countTekliflerByCekici(cekiciId: string): Promise<{
  toplam: number;
  kazanilan: number;
  fiyatDegistiren: number;
}> {
  const { data, error } = await getSupabaseAdmin()
    .from("teklifler")
    .select("durum, fiyat, ilk_fiyat, fiyat_degisti")
    .eq("cekici_id", cekiciId);
  if (error) throw error;
  const rows = data ?? [];
  let kazanilan = 0;
  let fiyatDegistiren = 0;
  for (const r of rows) {
    if (r.durum === "kazandi") kazanilan += 1;
    const ilk = r.ilk_fiyat != null ? Number(r.ilk_fiyat) : Number(r.fiyat);
    if (r.fiyat_degisti === true || Number(r.fiyat) !== ilk) {
      fiyatDegistiren += 1;
    }
  }
  return { toplam: rows.length, kazanilan, fiyatDegistiren };
}
