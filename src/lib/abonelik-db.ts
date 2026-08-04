import { randomUUID } from "crypto";
import { krediPaketBul } from "./kredi-fiyat";
import { getSupabaseAdmin } from "./supabase/admin";
import type {
  AbonelikIslemTip,
  AbonelikStatus,
  CekiciAbonelik,
} from "./types";

type AbonelikRow = {
  id: string;
  cekici_id: string;
  paket_tl: number;
  status: string;
  garanti_order_id?: string | null;
  garanti_original_retref_num?: string | null;
  garanti_client_ip?: string | null;
  renews_at?: string | null;
  ends_at?: string | null;
  subscribed_at: string;
  retry_count: number;
  next_retry_at?: string | null;
  created_at: string;
  updated_at: string;
};

function fromRow(r: AbonelikRow): CekiciAbonelik {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    paketTl: Number(r.paket_tl),
    status: r.status as AbonelikStatus,
    garantiOrderId: r.garanti_order_id ?? undefined,
    garantiOriginalRetrefNum: r.garanti_original_retref_num ?? undefined,
    garantiClientIp: r.garanti_client_ip ?? undefined,
    renewsAt: r.renews_at ?? undefined,
    endsAt: r.ends_at ?? undefined,
    subscribedAt: r.subscribed_at,
    retryCount: Number(r.retry_count ?? 0),
    nextRetryAt: r.next_retry_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function abonelikRenewsAtHesapla(from = new Date()): string {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export async function getAktifAbonelik(
  cekiciId: string
): Promise<CekiciAbonelik | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .select("*")
    .eq("cekici_id", cekiciId)
    .in("status", ["active", "past_due"])
    .order("subscribed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as AbonelikRow) : undefined;
}

export async function getAbonelikByGarantiOrderId(
  orderId: string
): Promise<CekiciAbonelik | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .select("*")
    .eq("garanti_order_id", orderId)
    .in("status", ["active", "past_due"])
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as AbonelikRow) : undefined;
}

export async function olusturCekiciAbonelik(opts: {
  cekiciId: string;
  paketTl: number;
  garantiOrderId: string;
  garantiOriginalRetrefNum?: string;
  garantiClientIp?: string;
}): Promise<CekiciAbonelik> {
  const now = new Date().toISOString();
  const row: AbonelikRow = {
    id: randomUUID(),
    cekici_id: opts.cekiciId,
    paket_tl: opts.paketTl,
    status: "active",
    garanti_order_id: opts.garantiOrderId,
    garanti_original_retref_num: opts.garantiOriginalRetrefNum ?? null,
    garanti_client_ip: opts.garantiClientIp ?? null,
    renews_at: abonelikRenewsAtHesapla(),
    ends_at: null,
    subscribed_at: now,
    retry_count: 0,
    next_retry_at: null,
    created_at: now,
    updated_at: now,
  };
  const { error } = await getSupabaseAdmin().from("cekici_abonelik").insert(row);
  if (error) throw error;
  return fromRow(row);
}

export async function kaydetAbonelikIslem(opts: {
  abonelikId: string;
  cekiciId: string;
  tip: AbonelikIslemTip;
  tutarTl: number;
  kredi: number;
  garantiOrderId?: string;
  eventId: string;
}): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("abonelik_islem").insert({
    id: randomUUID(),
    abonelik_id: opts.abonelikId,
    cekici_id: opts.cekiciId,
    tip: opts.tip,
    tutar_tl: opts.tutarTl,
    kredi: opts.kredi,
    garanti_order_id: opts.garantiOrderId ?? null,
    event_id: opts.eventId,
    created_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === "23505") return false; // unique event_id
    throw error;
  }
  return true;
}

export async function abonelikIslemVarMi(eventId: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from("abonelik_islem")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export type AbonelikIslemSatir = {
  tip: AbonelikIslemTip;
  tutarTl: number;
  kredi: number;
  garantiOrderId?: string;
  createdAt: string;
};

/** Panel özet — abonelik tahsilatları (created / renewal vb.) */
export async function listeleAbonelikIslemleriSince(
  sinceIso: string
): Promise<AbonelikIslemSatir[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("abonelik_islem")
    .select("tip, tutar_tl, kredi, garanti_order_id, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (
    (data as
      | {
          tip: string;
          tutar_tl: number;
          kredi: number;
          garanti_order_id?: string | null;
          created_at: string;
        }[]
      | null) ?? []
  ).map((r) => ({
    tip: r.tip as AbonelikIslemTip,
    tutarTl: Number(r.tutar_tl),
    kredi: Number(r.kredi),
    garantiOrderId: r.garanti_order_id ?? undefined,
    createdAt: r.created_at,
  }));
}

export async function guncelleAbonelik(
  id: string,
  patch: Partial<{
    status: AbonelikStatus;
    renewsAt: string | null;
    endsAt: string | null;
    retryCount: number;
    nextRetryAt: string | null;
  }>
): Promise<void> {
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.renewsAt !== undefined) row.renews_at = patch.renewsAt;
  if (patch.endsAt !== undefined) row.ends_at = patch.endsAt;
  if (patch.retryCount !== undefined) row.retry_count = patch.retryCount;
  if (patch.nextRetryAt !== undefined) row.next_retry_at = patch.nextRetryAt;

  const { error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .update(row)
    .eq("id", id);
  if (error) throw error;
}

export async function listAboneliklerYenilemeKontrol(): Promise<CekiciAbonelik[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .select("*")
    .in("status", ["active", "past_due"]);
  if (error) throw error;
  return (data as AbonelikRow[] | null)?.map(fromRow) ?? [];
}

/** İptal edilmiş; dönem (renews_at) bitmiş — abonelik kredisi yakılacak adaylar */
export async function listIptalDonemSonuAbonelikler(
  now = new Date()
): Promise<CekiciAbonelik[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .select("*")
    .eq("status", "cancelled")
    .not("renews_at", "is", null)
    .lte("renews_at", now.toISOString());
  if (error) throw error;
  return (data as AbonelikRow[] | null)?.map(fromRow) ?? [];
}

export function abonelikPaketKredisi(paketTl: number): number {
  return krediPaketBul(paketTl, "abonelik")?.kredi ?? 0;
}

/** Retry backoff: 1g, 3g, 7g */
export function abonelikNextRetryAt(retryCount: number, from = new Date()): string {
  const days = retryCount <= 1 ? 1 : retryCount === 2 ? 3 : 7;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
