import { randomUUID } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  faturaBelgeNoUret,
  faturaDeepLinkExpiresAt,
  faturaTokenUret,
} from "./fatura-link";

export type FaturaLink = {
  id: string;
  token: string;
  cekiciId: string;
  krediOdemeId: string | null;
  storagePath: string;
  belgeNo: string;
  expiresAt: string;
  createdAt: string;
  sonErisimAt: string | null;
};

type FaturaLinkRow = {
  id: string;
  token: string;
  cekici_id: string;
  kredi_odeme_id: string | null;
  storage_path: string;
  belge_no: string;
  expires_at: string;
  created_at: string;
  son_erisim_at: string | null;
};

function fromRow(r: FaturaLinkRow): FaturaLink {
  return {
    id: r.id,
    token: r.token,
    cekiciId: r.cekici_id,
    krediOdemeId: r.kredi_odeme_id,
    storagePath: r.storage_path,
    belgeNo: r.belge_no,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
    sonErisimAt: r.son_erisim_at,
  };
}

export async function getFaturaLinkByToken(
  token: string
): Promise<FaturaLink | null> {
  if (!supabaseDbAktif()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("fatura_link")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as FaturaLinkRow) : null;
}

export async function getFaturaLinkById(
  id: string
): Promise<FaturaLink | null> {
  if (!supabaseDbAktif()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("fatura_link")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as FaturaLinkRow) : null;
}

export async function getFaturaLinkByKrediOdemeId(
  krediOdemeId: string
): Promise<FaturaLink | null> {
  if (!supabaseDbAktif()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("fatura_link")
    .select("*")
    .eq("kredi_odeme_id", krediOdemeId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as FaturaLinkRow) : null;
}

export async function listeleFaturaLinkCekici(
  cekiciId: string
): Promise<FaturaLink[]> {
  if (!supabaseDbAktif()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("fatura_link")
    .select("*")
    .eq("cekici_id", cekiciId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as FaturaLinkRow[]).map(fromRow);
}

export async function listeleFaturaLinkSon(
  limit = 50
): Promise<FaturaLink[]> {
  if (!supabaseDbAktif()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("fatura_link")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as FaturaLinkRow[]).map(fromRow);
}

export async function olusturFaturaLink(opts: {
  id?: string;
  cekiciId: string;
  krediOdemeId?: string | null;
  storagePath: string;
  belgeNo?: string;
  expiresAt?: Date;
}): Promise<FaturaLink> {
  const kayit: FaturaLinkRow = {
    id: opts.id ?? randomUUID(),
    token: faturaTokenUret(),
    cekici_id: opts.cekiciId,
    kredi_odeme_id: opts.krediOdemeId ?? null,
    storage_path: opts.storagePath,
    belge_no: opts.belgeNo ?? faturaBelgeNoUret(),
    expires_at: (opts.expiresAt ?? faturaDeepLinkExpiresAt()).toISOString(),
    created_at: new Date().toISOString(),
    son_erisim_at: null,
  };

  const { data, error } = await getSupabaseAdmin()
    .from("fatura_link")
    .insert(kayit)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as FaturaLinkRow);
}

export async function isaretleFaturaSonErisim(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("fatura_link")
    .update({ son_erisim_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
