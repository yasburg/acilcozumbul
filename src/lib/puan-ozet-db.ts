import { getSupabaseAdmin } from "./supabase/admin";

export type CekiciPuanOzetRow = {
  cekici_id: string;
  toplam_teklif: number;
  kazanilan: number;
  anlasilan: number;
  fiyat_degistiren: number;
  guncelleme: string;
};

export async function getCekiciPuanOzetRow(
  cekiciId: string
): Promise<CekiciPuanOzetRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_puan_ozet")
    .select("*")
    .eq("cekici_id", cekiciId)
    .maybeSingle();
  if (error) throw error;
  return data as CekiciPuanOzetRow | null;
}

export async function getCekiciPuanOzetRows(
  cekiciIds: string[]
): Promise<Map<string, CekiciPuanOzetRow>> {
  const map = new Map<string, CekiciPuanOzetRow>();
  if (cekiciIds.length === 0) return map;
  const unique = [...new Set(cekiciIds)];
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_puan_ozet")
    .select("*")
    .in("cekici_id", unique);
  if (error) throw error;
  for (const row of (data ?? []) as CekiciPuanOzetRow[]) {
    map.set(row.cekici_id, row);
  }
  return map;
}

export async function upsertCekiciPuanOzet(input: {
  cekiciId: string;
  toplamTeklif: number;
  kazanilan: number;
  anlasilan: number;
  fiyatDegistiren: number;
}): Promise<void> {
  const { error } = await getSupabaseAdmin().from("cekici_puan_ozet").upsert(
    {
      cekici_id: input.cekiciId,
      toplam_teklif: input.toplamTeklif,
      kazanilan: input.kazanilan,
      anlasilan: input.anlasilan,
      fiyat_degistiren: input.fiyatDegistiren,
      guncelleme: new Date().toISOString(),
    },
    { onConflict: "cekici_id" }
  );
  if (error) throw error;
}

/** Teklif/anlaşma sonrası cache’i teklifler + talepler’den yeniden hesapla */
export async function refreshCekiciPuanOzet(cekiciId: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const [teklifRes, anlasmaRes] = await Promise.all([
    sb
      .from("teklifler")
      .select("durum, fiyat, ilk_fiyat, fiyat_degisti")
      .eq("cekici_id", cekiciId),
    sb
      .from("talepler")
      .select("id", { count: "exact", head: true })
      .eq("kazanan_cekici_id", cekiciId)
      .eq("durum", "anlaşıldı"),
  ]);
  if (teklifRes.error) throw teklifRes.error;
  if (anlasmaRes.error) throw anlasmaRes.error;

  const rows = teklifRes.data ?? [];
  let kazanilan = 0;
  let fiyatDegistiren = 0;
  for (const r of rows) {
    if (r.durum === "kazandi") kazanilan += 1;
    const ilk = r.ilk_fiyat != null ? Number(r.ilk_fiyat) : Number(r.fiyat);
    if (r.fiyat_degisti === true || Number(r.fiyat) !== ilk) {
      fiyatDegistiren += 1;
    }
  }

  await upsertCekiciPuanOzet({
    cekiciId,
    toplamTeklif: rows.length,
    kazanilan,
    anlasilan: anlasmaRes.count ?? 0,
    fiyatDegistiren,
  });
}
