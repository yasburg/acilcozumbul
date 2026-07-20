import { getSupabaseAdmin } from "./supabase/admin";
import {
  cekiciFromRow,
  cekiciToRow,
  smsFromRow,
  smsToRow,
  talepFromRow,
  talepToRow,
  type CekiciRow,
  type SmsLogRow,
  type TalepRow,
} from "./supabase/mappers";
import type { BelgeDurum, Cekici, SmsKaydi, Talep } from "./types";
import { davetKoduNormalize } from "./davet-kodu";
import {
  hydrateTalepIliskileri,
  listBildirilenCekiciIds,
  listHaricCekiciIds,
  syncBildirilenCekiciler,
  syncHaricCekiciler,
} from "./talep-iliski-db";
import {
  listTekliflerByTalep,
  listTekliflerByTalepIds,
  syncTekliflerForTalep,
} from "./teklif-db";

/** false: JSON kolon fallback (yalnızca geçiş). Varsayılan: normalize tablolar. */
export function teklifReadFromTable(): boolean {
  return process.env.TEKLIF_READ_FROM_TABLE !== "false";
}

export function bugunBaslangicIso(now = new Date()): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function hydrateTalep(talep: Talep, row?: TalepRow): Promise<Talep> {
  if (!teklifReadFromTable()) {
    return talep;
  }

  try {
    const [teklifler, bildirilen, haric] = await Promise.all([
      listTekliflerByTalep(talep.id),
      listBildirilenCekiciIds(talep.id),
      listHaricCekiciIds(talep.id),
    ]);
    if (teklifler.length > 0 || !row?.teklifler?.length) {
      talep.teklifler = teklifler;
    }
    if (bildirilen.length > 0 || !row?.bildirilen_cekici_ids?.length) {
      talep.bildirilenCekiciIds = bildirilen;
    }
    if (haric.length > 0 || !row?.haric_tutulan_cekici_ids?.length) {
      talep.haricTutulanCekiciIds = haric;
    }
  } catch (e) {
    // Tablo henüz yoksa (migration öncesi) JSON satırına düş
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "42P01" && code !== "PGRST205") throw e;
  }
  return talep;
}

async function hydrateTalepler(talepler: Talep[], rows: TalepRow[]): Promise<Talep[]> {
  if (!teklifReadFromTable() || talepler.length === 0) return talepler;

  try {
    const ids = talepler.map((t) => t.id);
    const [teklifMap, iliski] = await Promise.all([
      listTekliflerByTalepIds(ids),
      hydrateTalepIliskileri(ids),
    ]);
    const rowById = new Map(rows.map((r) => [r.id, r]));
    for (const t of talepler) {
      const fromTable = teklifMap.get(t.id) ?? [];
      const row = rowById.get(t.id);
      if (fromTable.length > 0 || !row?.teklifler?.length) {
        t.teklifler = fromTable;
      }
      const bildirilen = iliski.bildirilen.get(t.id) ?? [];
      if (bildirilen.length > 0 || !row?.bildirilen_cekici_ids?.length) {
        t.bildirilenCekiciIds = bildirilen;
      }
      const haric = iliski.haric.get(t.id) ?? [];
      if (haric.length > 0 || !row?.haric_tutulan_cekici_ids?.length) {
        t.haricTutulanCekiciIds = haric;
      }
    }
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "42P01" && code !== "PGRST205") throw e;
  }
  return talepler;
}

async function syncTalepIliskileri(talep: Talep): Promise<void> {
  try {
    await Promise.all([
      syncTekliflerForTalep(talep.id, talep.teklifler ?? []),
      syncBildirilenCekiciler(talep.id, talep.bildirilenCekiciIds ?? []),
      syncHaricCekiciler(talep.id, talep.haricTutulanCekiciIds ?? []),
    ]);
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "42P01" && code !== "PGRST205") throw e;
  }
}

export async function getCekiciler(): Promise<Cekici[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .order("kayit_tarihi", { ascending: false });
  if (error) throw error;
  return (data as CekiciRow[]).map(cekiciFromRow);
}

/** Bildirim adayları — kaba SQL filtresi (aktif + yeterli kredi) */
export async function getCekicilerBildirimAdaylari(
  minKredi: number
): Promise<Cekici[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .eq("aktif", true)
    .gte("kredi", minKredi);
  if (error) throw error;
  return (data as CekiciRow[]).map(cekiciFromRow);
}

export async function countCekiciler(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

/** Belge / rozet talebi bekleyen çekici sayısı */
export async function countCekicilerBelgeDurum(
  durum: BelgeDurum
): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*", { count: "exact", head: true })
    .eq("belge_durum", durum);
  if (error) throw error;
  return count ?? 0;
}

export async function getCekiciById(id: string): Promise<Cekici | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? cekiciFromRow(data as CekiciRow) : undefined;
}

export async function getCekiciByToken(token: string): Promise<Cekici | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return data ? cekiciFromRow(data as CekiciRow) : undefined;
}

export async function getCekiciByTelefon(
  telefon: string
): Promise<Cekici | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .eq("telefon", telefon)
    .maybeSingle();
  if (error) throw error;
  return data ? cekiciFromRow(data as CekiciRow) : undefined;
}

/** Ödeme akışında doğrulanmış fatura e-postası ile giriş */
export async function getCekiciByDogrulanmisFaturaEposta(
  eposta: string
): Promise<Cekici | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .eq("fatura_eposta", eposta)
    .not("fatura_eposta_dogrulandi", "is", null)
    .maybeSingle();
  if (error) throw error;
  return data ? cekiciFromRow(data as CekiciRow) : undefined;
}

export async function getCekiciByDavetKodu(
  kod: string
): Promise<Cekici | undefined> {
  const normalized = davetKoduNormalize(kod);
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("cekiciler")
    .select("*")
    .eq("davet_kodu", normalized)
    .maybeSingle();
  if (error) throw error;
  if (data) return cekiciFromRow(data as CekiciRow);

  const { data: ilikeData, error: ilikeErr } = await sb
    .from("cekiciler")
    .select("*")
    .ilike("davet_kodu", normalized)
    .maybeSingle();
  if (ilikeErr) throw ilikeErr;
  return ilikeData ? cekiciFromRow(ilikeData as CekiciRow) : undefined;
}

export async function setCekiciDavetKodu(
  id: string,
  davetKodu: string
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekiciler")
    .update({ davet_kodu: davetKodu })
    .eq("id", id);
  if (error) throw error;
}

export async function kaydetDavetKullanim(kayit: {
  davetKodu: string;
  davetEdenId: string;
  yeniCekiciId: string;
  davetliKredi: number;
  davetEdenKredi: number;
}): Promise<void> {
  const { error } = await getSupabaseAdmin().from("davet_kullanimlari").insert({
    davet_kodu: kayit.davetKodu,
    davet_eden_id: kayit.davetEdenId,
    yeni_cekici_id: kayit.yeniCekiciId,
    davetli_kredi: kayit.davetliKredi,
    davet_eden_kredi: kayit.davetEdenKredi,
  });
  if (error) throw error;
}

export async function addCekici(cekici: Cekici): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekiciler")
    .insert(cekiciToRow(cekici));
  if (error) throw error;
}

export async function updateCekici(cekici: Cekici): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekiciler")
    .update(cekiciToRow(cekici))
    .eq("id", cekici.id);
  if (error) throw error;
}

export async function updateCekiciBelgeDurum(
  id: string,
  patch: { belgeDurum: BelgeDurum; belgeRedNedeni?: string | null }
): Promise<BelgeDurum> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .update({
      belge_durum: patch.belgeDurum,
      belge_red_nedeni:
        patch.belgeDurum === "reddedildi"
          ? (patch.belgeRedNedeni?.trim() ?? null)
          : null,
    })
    .eq("id", id)
    .select("belge_durum")
    .single();
  if (error) throw error;
  return (data.belge_durum as BelgeDurum) ?? patch.belgeDurum;
}

export async function saveCekiciler(
  cekiciler: Cekici[],
  opts?: { migrationsOnly?: boolean }
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekiciler")
    .upsert(cekiciler.map((c) => cekiciToRow(c, opts)), { onConflict: "id" });
  if (error) throw error;
}

/** @deprecated Full scan — scoped helper kullanın */
export async function getTalepler(): Promise<Talep[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as TalepRow[];
  return hydrateTalepler(rows.map(talepFromRow), rows);
}

export async function getTaleplerSince(sinceIso: string): Promise<Talep[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .gte("olusturulma", sinceIso)
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as TalepRow[];
  return hydrateTalepler(rows.map(talepFromRow), rows);
}

export async function getTaleplerBugun(): Promise<Talep[]> {
  return getTaleplerSince(bugunBaslangicIso());
}

export async function getTaleplerByKazananCekici(
  cekiciId: string
): Promise<Talep[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .eq("kazanan_cekici_id", cekiciId)
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as TalepRow[];
  return hydrateTalepler(rows.map(talepFromRow), rows);
}

export async function getTaleplerMemnuniyetBekleyen(): Promise<Talep[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .eq("durum", "anlaşıldı")
    .eq("memnuniyet_sms_gonderildi", false)
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as TalepRow[];
  return hydrateTalepler(rows.map(talepFromRow), rows);
}

export async function countTalepler(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getTaleplerSayfali(opts?: {
  limit?: number;
  offset?: number;
}): Promise<{ talepler: Talep[]; total: number }> {
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const offset = Math.max(opts?.offset ?? 0, 0);
  const { data, error, count } = await getSupabaseAdmin()
    .from("talepler")
    .select("*", { count: "exact" })
    .order("olusturulma", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  const rows = (data ?? []) as TalepRow[];
  const talepler = await hydrateTalepler(rows.map(talepFromRow), rows);
  return { talepler, total: count ?? talepler.length };
}

export async function getTalepById(id: string): Promise<Talep | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const row = data as TalepRow;
  return hydrateTalep(talepFromRow(row), row);
}

export async function addTalep(talep: Talep): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("talepler")
    .insert(talepToRow(talep));
  if (error) throw error;
  await syncTalepIliskileri(talep);
}

export async function updateTalep(talep: Talep): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("talepler")
    .update(talepToRow(talep))
    .eq("id", talep.id);
  if (error) throw error;
  await syncTalepIliskileri(talep);
}

export async function getSmsLog(opts?: {
  sinceIso?: string;
  limit?: number;
  cekiciId?: string;
}): Promise<SmsKaydi[]> {
  let q = getSupabaseAdmin()
    .from("sms_log")
    .select("*")
    .order("gonderim", { ascending: false });
  if (opts?.sinceIso) q = q.gte("gonderim", opts.sinceIso);
  if (opts?.cekiciId) q = q.eq("cekici_id", opts.cekiciId);
  if (opts?.limit != null) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => smsFromRow(r as SmsLogRow));
}

export async function countSmsLog(opts?: {
  sinceIso?: string;
  gonderildi?: boolean;
}): Promise<number> {
  let q = getSupabaseAdmin()
    .from("sms_log")
    .select("*", { count: "exact", head: true });
  if (opts?.sinceIso) q = q.gte("gonderim", opts.sinceIso);
  if (opts?.gonderildi != null) q = q.eq("gonderildi", opts.gonderildi);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export async function addSmsKaydi(kayit: SmsKaydi): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("sms_log")
    .insert(smsToRow(kayit));
  if (error) throw error;
}
