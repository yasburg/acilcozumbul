/**
 * Sesli mesaj gönderim / Netgsm durum-DTMF logları + sağlık özeti.
 */

import { randomUUID } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { telefonNormalize } from "./telefon";

function cekiciIdRelationdan(relationid?: string | null): string | undefined {
  const raw = String(relationid ?? "").trim();
  const m = /^t:[a-zA-Z0-9_-]+:c:([a-zA-Z0-9_-]+)$/.exec(raw);
  return m?.[1];
}

export type SesliMesajOlayTipi = "gonderim" | "rapor";

export type SesliMesajKaydi = {
  id: string;
  olayTipi: SesliMesajOlayTipi;
  sablonId?: string;
  telefon?: string;
  bulkid?: string;
  relationid?: string;
  cekiciId?: string;
  talepId?: string;
  basarili?: boolean;
  hata?: string;
  audioId?: string;
  state?: number;
  pushButton?: string;
  answerTime?: string;
  bilsec?: number;
  raw?: Record<string, unknown>;
  olusturulma: string;
};

export type SesliSaglikOzet = {
  pencereSaat: number;
  gonderim: number;
  gonderimBasarili: number;
  gonderimBasarisiz: number;
  /** Netgsm state=1 */
  acilan: number;
  cevaplanmayan: number;
  ulasilamayan: number;
  mesgul: number;
  raporToplam: number;
  /** push_button 0–9 (geçerli tuş) */
  tusTiklama: number;
  tusDagilim: Record<string, number>;
  stateDagilim: Record<string, number>;
  sonRaporlar: Array<{
    olusturulma: string;
    telefon?: string;
    state?: number;
    pushButton?: string;
    relationid?: string;
  }>;
};

const STATE_ETIKET: Record<number, string> = {
  1: "acilan",
  2: "cevaplanmayan",
  3: "ulasilamayan",
  7: "mesgul",
};

export function sesliStateEtiket(state: number | null | undefined): string {
  if (state == null || !Number.isFinite(state)) return "bilinmiyor";
  return STATE_ETIKET[state] ?? `state_${state}`;
}

function talepIdRelationdan(relationid?: string | null): string | undefined {
  const raw = String(relationid ?? "").trim();
  const t = /^t:([a-zA-Z0-9_-]+):c:/.exec(raw);
  if (t) return t[1];
  const m = /^musteri-talep:([a-zA-Z0-9_-]+)$/.exec(raw);
  if (m) return m[1];
  return undefined;
}

export async function sesliMesajKaydiEkle(
  kayit: Omit<SesliMesajKaydi, "id" | "olusturulma"> & {
    id?: string;
    olusturulma?: string;
  }
): Promise<void> {
  if (!supabaseDbAktif()) return;
  const row = {
    id: kayit.id ?? randomUUID(),
    olay_tipi: kayit.olayTipi,
    sablon_id: kayit.sablonId ?? null,
    telefon: kayit.telefon ?? null,
    bulkid: kayit.bulkid ?? null,
    relationid: kayit.relationid ?? null,
    cekici_id: kayit.cekiciId ?? null,
    talep_id: kayit.talepId ?? null,
    basarili: kayit.basarili ?? null,
    hata: kayit.hata ?? null,
    audio_id: kayit.audioId ?? null,
    state: kayit.state ?? null,
    push_button: kayit.pushButton ?? null,
    answer_time: kayit.answerTime ?? null,
    bilsec: kayit.bilsec ?? null,
    raw: kayit.raw ?? null,
    olusturulma: kayit.olusturulma ?? new Date().toISOString(),
  };
  const { error } = await getSupabaseAdmin()
    .from("sesli_mesaj_log")
    .insert(row);
  if (error) {
    console.error("[sesli_mesaj_log] insert", error.message);
  }
}

export async function sesliMesajGonderimKaydet(opts: {
  sablonId: string;
  telefon: string;
  basarili: boolean;
  hata?: string;
  bulkid?: string;
  relationid?: string;
  audioId?: string;
}): Promise<void> {
  const relationid = opts.relationid?.trim() || undefined;
  const cekiciId = cekiciIdRelationdan(relationid);
  await sesliMesajKaydiEkle({
    olayTipi: "gonderim",
    sablonId: opts.sablonId,
    telefon: telefonNormalize(opts.telefon) || opts.telefon,
    basarili: opts.basarili,
    hata: opts.hata,
    bulkid: opts.bulkid,
    relationid,
    cekiciId,
    talepId: talepIdRelationdan(relationid),
    audioId: opts.audioId,
  });
}

export async function sesliMesajRaporKaydet(opts: {
  telefon?: string;
  bulkid?: string;
  relationid?: string;
  state?: number | null;
  pushButton?: string | null;
  answerTime?: string | null;
  bilsec?: number | null;
  raw?: Record<string, unknown>;
}): Promise<void> {
  const relationid = opts.relationid?.trim() || undefined;
  const telRaw = opts.telefon?.trim();
  const telefon = telRaw
    ? telefonNormalize(telRaw.startsWith("0") ? telRaw : `0${telRaw}`) ||
      telRaw
    : undefined;
  await sesliMesajKaydiEkle({
    olayTipi: "rapor",
    telefon,
    bulkid: opts.bulkid != null ? String(opts.bulkid) : undefined,
    relationid,
    cekiciId: cekiciIdRelationdan(relationid),
    talepId: talepIdRelationdan(relationid),
    state: opts.state ?? undefined,
    pushButton:
      opts.pushButton != null && opts.pushButton !== ""
        ? String(opts.pushButton)
        : undefined,
    answerTime: opts.answerTime ?? undefined,
    bilsec:
      opts.bilsec != null && Number.isFinite(opts.bilsec)
        ? Number(opts.bilsec)
        : undefined,
    raw: opts.raw,
  });
}

export async function getSesliMesajLog(opts?: {
  sinceIso?: string;
  limit?: number;
}): Promise<SesliMesajKaydi[]> {
  if (!supabaseDbAktif()) return [];
  let q = getSupabaseAdmin()
    .from("sesli_mesaj_log")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (opts?.sinceIso) q = q.gte("olusturulma", opts.sinceIso);
  if (opts?.limit != null) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    console.error("[sesli_mesaj_log] select", error.message);
    return [];
  }
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    olayTipi: r.olay_tipi as SesliMesajOlayTipi,
    sablonId: r.sablon_id ?? undefined,
    telefon: r.telefon ?? undefined,
    bulkid: r.bulkid ?? undefined,
    relationid: r.relationid ?? undefined,
    cekiciId: r.cekici_id ?? undefined,
    talepId: r.talep_id ?? undefined,
    basarili: r.basarili ?? undefined,
    hata: r.hata ?? undefined,
    audioId: r.audio_id ?? undefined,
    state: r.state ?? undefined,
    pushButton: r.push_button ?? undefined,
    answerTime: r.answer_time ?? undefined,
    bilsec: r.bilsec != null ? Number(r.bilsec) : undefined,
    raw: (r.raw as Record<string, unknown> | null) ?? undefined,
    olusturulma: r.olusturulma,
  }));
}

function tusGecerliMi(push?: string): boolean {
  if (push == null || push === "" || push === "-1" || push === "null") {
    return false;
  }
  const n = Number(push);
  return Number.isInteger(n) && n >= 0 && n <= 9;
}

export function sesliSaglikOzet(
  kayitlar: SesliMesajKaydi[],
  pencereSaat = 24
): SesliSaglikOzet {
  const since = Date.now() - pencereSaat * 60 * 60 * 1000;
  const pencere = kayitlar.filter(
    (k) => new Date(k.olusturulma).getTime() >= since
  );
  const gonderimler = pencere.filter((k) => k.olayTipi === "gonderim");
  const raporlar = pencere.filter((k) => k.olayTipi === "rapor");

  const stateDagilim: Record<string, number> = {};
  const tusDagilim: Record<string, number> = {};
  let acilan = 0;
  let cevaplanmayan = 0;
  let ulasilamayan = 0;
  let mesgul = 0;
  let tusTiklama = 0;

  for (const r of raporlar) {
    const etiket = sesliStateEtiket(r.state);
    stateDagilim[etiket] = (stateDagilim[etiket] ?? 0) + 1;
    if (r.state === 1) acilan += 1;
    else if (r.state === 2) cevaplanmayan += 1;
    else if (r.state === 3) ulasilamayan += 1;
    else if (r.state === 7) mesgul += 1;

    if (tusGecerliMi(r.pushButton)) {
      tusTiklama += 1;
      const t = String(r.pushButton);
      tusDagilim[t] = (tusDagilim[t] ?? 0) + 1;
    }
  }

  return {
    pencereSaat,
    gonderim: gonderimler.length,
    gonderimBasarili: gonderimler.filter((g) => g.basarili).length,
    gonderimBasarisiz: gonderimler.filter((g) => g.basarili === false).length,
    acilan,
    cevaplanmayan,
    ulasilamayan,
    mesgul,
    raporToplam: raporlar.length,
    tusTiklama,
    tusDagilim,
    stateDagilim,
    sonRaporlar: raporlar.slice(0, 12).map((r) => ({
      olusturulma: r.olusturulma,
      telefon: r.telefon,
      state: r.state,
      pushButton: r.pushButton,
      relationid: r.relationid,
    })),
  };
}
