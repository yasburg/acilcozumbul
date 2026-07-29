import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { getCekiciById, getCekiciler } from "./db";
import { talepSehriAcikMi } from "./cekici-sehir-acilis-db";
import {
  cekiciKrediHatirlatmaAdayiMi,
  cekiciKrediHatirlatmaManuelAdayiMi,
  krediHatirlatmaDurdurulduMu,
  krediHatirlatmaKisaUrl,
  krediHatirlatmaSmsMetni,
  krediHatirlatmaTokenGecerliMi,
  krediHatirlatmaTokenUret,
  type KrediHatirlatmaCekiciOzet,
  type KrediHatirlatmaKaynak,
} from "./kredi-hatirlatma";
import { sendSms } from "./sms-provider";
import { telefonNormalize } from "./telefon";
import type { Cekici, Talep } from "./types";

let tabloVar: boolean | null = null;

export async function krediHatirlatmaTablosuVar(): Promise<boolean> {
  if (tabloVar !== null) return tabloVar;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("kredi_hatirlatma_gonderim")
    .select("id")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

export type KrediHatirlatmaGonderim = {
  id: string;
  token: string;
  cekiciId: string;
  telefon: string;
  talepId: string | null;
  kaynak: KrediHatirlatmaKaynak;
  olusturulma: string;
  smsBasarili: boolean;
  ilkTiklama: string | null;
  tiklamaSayisi: number;
  krediYuklemeAt: string | null;
};

function rowToGonderim(r: Record<string, unknown>): KrediHatirlatmaGonderim {
  return {
    id: String(r.id),
    token: String(r.token),
    cekiciId: String(r.cekici_id),
    telefon: String(r.telefon),
    talepId: r.talep_id ? String(r.talep_id) : null,
    kaynak: r.kaynak === "manuel" ? "manuel" : "otomatik",
    olusturulma: String(r.olusturulma),
    smsBasarili: Boolean(r.sms_basarili),
    ilkTiklama: r.ilk_tiklama ? String(r.ilk_tiklama) : null,
    tiklamaSayisi: Number(r.tiklama_sayisi) || 0,
    krediYuklemeAt: r.kredi_yukleme_at ? String(r.kredi_yukleme_at) : null,
  };
}

const SELECT_COLS =
  "id, token, cekici_id, telefon, talep_id, kaynak, olusturulma, sms_basarili, ilk_tiklama, tiklama_sayisi, kredi_yukleme_at";

const MAX_TOKEN_DENEME = 8;

export async function olusturKrediHatirlatmaGonderim(opts: {
  cekiciId: string;
  telefon: string;
  talepId?: string | null;
  kaynak: KrediHatirlatmaKaynak;
}): Promise<KrediHatirlatmaGonderim> {
  if (!(await krediHatirlatmaTablosuVar())) {
    throw new Error(
      "kredi_hatirlatma_gonderim yok. supabase/migrations/037_kredi_hatirlatma.sql çalıştırın."
    );
  }
  const telefon = telefonNormalize(opts.telefon);
  const sb = getSupabaseAdmin();

  for (let i = 0; i < MAX_TOKEN_DENEME; i++) {
    const token = krediHatirlatmaTokenUret();
    const { data, error } = await sb
      .from("kredi_hatirlatma_gonderim")
      .insert({
        token,
        cekici_id: opts.cekiciId,
        telefon,
        talep_id: opts.talepId ?? null,
        kaynak: opts.kaynak,
        sms_basarili: false,
      })
      .select(SELECT_COLS)
      .single();

    if (!error && data) {
      return rowToGonderim(data as Record<string, unknown>);
    }
    const duplicate =
      error?.code === "23505" ||
      String(error?.message ?? "").toLowerCase().includes("duplicate");
    if (!duplicate) throw error ?? new Error("Hatırlatma kaydı başarısız.");
  }
  throw new Error("Benzersiz hatırlatma token üretilemedi.");
}

export async function isaretleKrediHatirlatmaSmsSonuc(
  id: string,
  basarili: boolean
): Promise<void> {
  if (!(await krediHatirlatmaTablosuVar())) return;
  const { error } = await getSupabaseAdmin()
    .from("kredi_hatirlatma_gonderim")
    .update({ sms_basarili: basarili })
    .eq("id", id);
  if (error) console.error("[kredi-hatirlatma] sms sonuc", error.message);
}

export async function getKrediHatirlatmaByToken(
  token: string
): Promise<KrediHatirlatmaGonderim | null> {
  if (!krediHatirlatmaTokenGecerliMi(token)) return null;
  if (!(await krediHatirlatmaTablosuVar())) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("kredi_hatirlatma_gonderim")
    .select(SELECT_COLS)
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToGonderim(data as Record<string, unknown>);
}

export async function kaydetKrediHatirlatmaTiklama(
  token: string
): Promise<KrediHatirlatmaGonderim | null> {
  const kayit = await getKrediHatirlatmaByToken(token);
  if (!kayit) return null;
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("kredi_hatirlatma_gonderim")
    .update({
      tiklama_sayisi: kayit.tiklamaSayisi + 1,
      ilk_tiklama: kayit.ilkTiklama ?? now,
    })
    .eq("token", token)
    .select(SELECT_COLS)
    .single();
  if (error) {
    console.error("[kredi-hatirlatma] tiklama", error.message);
    return kayit;
  }
  return rowToGonderim(data as Record<string, unknown>);
}

/** Çekicinin tüm yüksüz hatırlatmalarına yükleme zamanı yaz */
export async function baglaKrediHatirlatmaYukleme(
  cekiciId: string
): Promise<number> {
  if (!(await krediHatirlatmaTablosuVar())) return 0;
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("kredi_hatirlatma_gonderim")
    .update({ kredi_yukleme_at: now })
    .eq("cekici_id", cekiciId)
    .is("kredi_yukleme_at", null)
    .select("id");
  if (error) {
    console.error("[kredi-hatirlatma] yukleme bagla", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

/** cekiciId → özet map (tüm gönderimler üzerinden) */
export async function getKrediHatirlatmaOzetMap(
  cekiciIds?: string[]
): Promise<Map<string, KrediHatirlatmaCekiciOzet>> {
  const out = new Map<string, KrediHatirlatmaCekiciOzet>();
  if (!(await krediHatirlatmaTablosuVar())) return out;

  let q = getSupabaseAdmin()
    .from("kredi_hatirlatma_gonderim")
    .select(
      "cekici_id, sms_basarili, olusturulma, ilk_tiklama, kredi_yukleme_at"
    )
    .order("olusturulma", { ascending: false });

  if (cekiciIds && cekiciIds.length > 0) {
    q = q.in("cekici_id", cekiciIds);
  }

  const { data, error } = await q;
  if (error) throw error;

  for (const row of data ?? []) {
    const id = String(row.cekici_id);
    let o = out.get(id);
    if (!o) {
      o = {
        cekiciId: id,
        basariliGonderim: 0,
        yuklenmemisBasarili: 0,
        sonBasariliAt: null,
        tiklayan: false,
        yukledi: false,
      };
      out.set(id, o);
    }
    if (row.sms_basarili) {
      o.basariliGonderim += 1;
      if (!o.sonBasariliAt) o.sonBasariliAt = String(row.olusturulma);
      if (!row.kredi_yukleme_at) o.yuklenmemisBasarili += 1;
    }
    if (row.ilk_tiklama) o.tiklayan = true;
    if (row.kredi_yukleme_at) o.yukledi = true;
  }
  return out;
}

export type KrediHatirlatmaPanelOzet = {
  gonderilen: number;
  tiklayanCekici: number;
  yukleyenCekici: number;
  durdurulan: number;
};

export type KrediHatirlatmaPanelSatir = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kredi: number;
  gonderimSayisi: number;
  yuklenmemisBasarili: number;
  sonSms: string | null;
  tiklayan: boolean;
  yukledi: boolean;
  durum: "aktif" | "durduruldu";
};

export async function getKrediHatirlatmaPanelVerisi(): Promise<{
  ozet: KrediHatirlatmaPanelOzet;
  satirlar: KrediHatirlatmaPanelSatir[];
}> {
  const ozetMap = await getKrediHatirlatmaOzetMap();
  const tumCekiciler = await getCekiciler();
  const byId = new Map(tumCekiciler.map((c) => [c.id, c]));

  let gonderilen = 0;
  let tiklayanCekici = 0;
  let yukleyenCekici = 0;
  let durdurulan = 0;

  const satirlar: KrediHatirlatmaPanelSatir[] = [];

  for (const [cekiciId, o] of ozetMap) {
    gonderilen += o.basariliGonderim;
    if (o.tiklayan) tiklayanCekici += 1;
    if (o.yukledi) yukleyenCekici += 1;
    const durdur = krediHatirlatmaDurdurulduMu(o);
    if (durdur) durdurulan += 1;
    const c = byId.get(cekiciId);
    satirlar.push({
      cekiciId,
      ad: c?.ad ?? "—",
      telefon: c?.telefon ?? o.cekiciId,
      kredi: c?.kredi ?? 0,
      gonderimSayisi: o.basariliGonderim,
      yuklenmemisBasarili: o.yuklenmemisBasarili,
      sonSms: o.sonBasariliAt,
      tiklayan: o.tiklayan,
      yukledi: o.yukledi,
      durum: durdur ? "durduruldu" : "aktif",
    });
  }

  satirlar.sort((a, b) => {
    const ta = a.sonSms ? new Date(a.sonSms).getTime() : 0;
    const tb = b.sonSms ? new Date(b.sonSms).getTime() : 0;
    return tb - ta;
  });

  return {
    ozet: { gonderilen, tiklayanCekici, yukleyenCekici, durdurulan },
    satirlar,
  };
}

async function gonderBirCekiciye(opts: {
  cekici: Cekici;
  talepId?: string | null;
  kaynak: KrediHatirlatmaKaynak;
  baseUrl: string;
}): Promise<{ ok: boolean; token?: string; hata?: string }> {
  try {
    const kayit = await olusturKrediHatirlatmaGonderim({
      cekiciId: opts.cekici.id,
      telefon: opts.cekici.telefon,
      talepId: opts.talepId,
      kaynak: opts.kaynak,
    });
    const url = krediHatirlatmaKisaUrl(kayit.token, opts.baseUrl);
    const mesaj = krediHatirlatmaSmsMetni(url);
    const sonuc = await sendSms(opts.cekici.telefon, mesaj, {
      aliciTipi: "cekici",
      cekiciId: opts.cekici.id,
      talepId: opts.talepId ?? undefined,
      link: url,
      krediDus: false,
      kanal: "xml",
    });
    await isaretleKrediHatirlatmaSmsSonuc(kayit.id, sonuc.basarili);
    if (!sonuc.basarili) {
      return { ok: false, token: kayit.token, hata: sonuc.hata };
    }
    return { ok: true, token: kayit.token };
  } catch (e) {
    const hata = e instanceof Error ? e.message : "Gönderim hatası";
    console.error("[kredi-hatirlatma] gonder", hata);
    return { ok: false, hata };
  }
}

/**
 * Talep create sonrası — koşullu + kredisi yetmeyenlere (best-effort).
 */
export async function notifyKrediHatirlatma(
  talep: Talep,
  baseUrl: string,
  haricTutulan: string[] = []
): Promise<string[]> {
  if (!(await krediHatirlatmaTablosuVar())) return [];
  if (!(await talepSehriAcikMi(talep))) return [];

  const tum = await getCekiciler();
  const ids = tum.map((c) => c.id);
  const ozetMap = await getKrediHatirlatmaOzetMap(ids);
  const haric = new Set(haricTutulan);

  const adaylar = tum.filter(
    (c) =>
      !haric.has(c.id) &&
      cekiciKrediHatirlatmaAdayiMi(talep, c, ozetMap.get(c.id) ?? null, {
        cooldownUygula: true,
      })
  );

  const giden: string[] = [];
  await Promise.all(
    adaylar.map(async (cekici) => {
      const r = await gonderBirCekiciye({
        cekici,
        talepId: talep.id,
        kaynak: "otomatik",
        baseUrl,
      });
      if (r.ok) giden.push(cekici.id);
    })
  );
  return giden;
}

/** Panel manuel gönderim */
export async function manuelKrediHatirlatmaGonder(opts: {
  cekiciIds: string[];
  baseUrl: string;
}): Promise<{ gonderilen: number; hatalar: string[] }> {
  if (!(await krediHatirlatmaTablosuVar())) {
    throw new Error(
      "kredi_hatirlatma_gonderim yok. supabase/migrations/037_kredi_hatirlatma.sql çalıştırın."
    );
  }
  const ozetMap = await getKrediHatirlatmaOzetMap(opts.cekiciIds);
  const hatalar: string[] = [];
  let gonderilen = 0;

  for (const id of opts.cekiciIds) {
    const cekici = await getCekiciById(id);
    if (!cekici) {
      hatalar.push(`${id}: bulunamadı`);
      continue;
    }
    if (
      !cekiciKrediHatirlatmaManuelAdayiMi(
        cekici,
        ozetMap.get(cekici.id) ?? null
      )
    ) {
      hatalar.push(`${cekici.telefon}: aday değil (kredi/kural)`);
      continue;
    }
    const r = await gonderBirCekiciye({
      cekici,
      kaynak: "manuel",
      baseUrl: opts.baseUrl,
    });
    if (r.ok) gonderilen += 1;
    else hatalar.push(`${cekici.telefon}: ${r.hata ?? "başarısız"}`);
  }

  return { gonderilen, hatalar };
}

/** Panel: şu an manuel gönderilebilir adaylar */
export async function listeleKrediHatirlatmaManuelAdaylar(): Promise<
  {
    cekiciId: string;
    ad: string;
    telefon: string;
    kredi: number;
    gonderimSayisi: number;
    durum: "aktif" | "durduruldu";
  }[]
> {
  const tum = await getCekiciler();
  const ozetMap = await getKrediHatirlatmaOzetMap(tum.map((c) => c.id));
  const out: {
    cekiciId: string;
    ad: string;
    telefon: string;
    kredi: number;
    gonderimSayisi: number;
    durum: "aktif" | "durduruldu";
  }[] = [];

  for (const c of tum) {
    const o = ozetMap.get(c.id) ?? null;
    if (!cekiciKrediHatirlatmaManuelAdayiMi(c, o)) continue;
    out.push({
      cekiciId: c.id,
      ad: c.ad,
      telefon: c.telefon,
      kredi: c.kredi,
      gonderimSayisi: o?.basariliGonderim ?? 0,
      durum: o && krediHatirlatmaDurdurulduMu(o) ? "durduruldu" : "aktif",
    });
  }
  return out;
}
