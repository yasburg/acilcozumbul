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

export async function getCekiciler(): Promise<Cekici[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("*")
    .order("kayit_tarihi", { ascending: false });
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

export async function getTalepler(): Promise<Talep[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  return (data as TalepRow[]).map(talepFromRow);
}

export async function getTalepById(id: string): Promise<Talep | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("talepler")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? talepFromRow(data as TalepRow) : undefined;
}

export async function addTalep(talep: Talep): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("talepler")
    .insert(talepToRow(talep));
  if (error) throw error;
}

export async function updateTalep(talep: Talep): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("talepler")
    .update(talepToRow(talep))
    .eq("id", talep.id);
  if (error) throw error;
}

export async function getSmsLog(): Promise<SmsKaydi[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("sms_log")
    .select("*")
    .order("gonderim", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => smsFromRow(r as SmsLogRow));
}

export async function addSmsKaydi(kayit: SmsKaydi): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("sms_log")
    .insert(smsToRow(kayit));
  if (error) throw error;
}
