import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { getCekiciById, getCekiciler } from "./db";
import {
  cekiciKurulumHatirlatmaAdayiMi,
  kurulumHatirlatmaDurdurulduMu,
  kurulumHatirlatmaKisaUrl,
  kurulumHatirlatmaMesajIndex,
  kurulumHatirlatmaSmsMetni,
  kurulumHatirlatmaTokenGecerliMi,
  kurulumHatirlatmaTokenUret,
  type KurulumHatirlatmaCekiciOzet,
  type KurulumHatirlatmaKaynak,
} from "./kurulum-hatirlatma";
import { sendSms } from "./sms-provider";
import { telefonNormalize } from "./telefon";
import type { Cekici } from "./types";

let tabloVar: boolean | null = null;

export async function kurulumHatirlatmaTablosuVar(): Promise<boolean> {
  if (tabloVar !== null) return tabloVar;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("kurulum_hatirlatma_gonderim")
    .select("id")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

export type KurulumHatirlatmaGonderim = {
  id: string;
  token: string;
  cekiciId: string;
  telefon: string;
  kaynak: KurulumHatirlatmaKaynak;
  mesajIndex: number;
  olusturulma: string;
  smsBasarili: boolean;
  ilkTiklama: string | null;
  tiklamaSayisi: number;
  kurulumTamamAt: string | null;
};

function rowToGonderim(r: Record<string, unknown>): KurulumHatirlatmaGonderim {
  return {
    id: String(r.id),
    token: String(r.token),
    cekiciId: String(r.cekici_id),
    telefon: String(r.telefon),
    kaynak: "manuel",
    mesajIndex: Number(r.mesaj_index) || 0,
    olusturulma: String(r.olusturulma),
    smsBasarili: Boolean(r.sms_basarili),
    ilkTiklama: r.ilk_tiklama ? String(r.ilk_tiklama) : null,
    tiklamaSayisi: Number(r.tiklama_sayisi) || 0,
    kurulumTamamAt: r.kurulum_tamam_at ? String(r.kurulum_tamam_at) : null,
  };
}

const SELECT_COLS =
  "id, token, cekici_id, telefon, kaynak, mesaj_index, olusturulma, sms_basarili, ilk_tiklama, tiklama_sayisi, kurulum_tamam_at";

const MAX_TOKEN_DENEME = 8;

export async function olusturKurulumHatirlatmaGonderim(opts: {
  cekiciId: string;
  telefon: string;
  mesajIndex: number;
  kaynak?: KurulumHatirlatmaKaynak;
}): Promise<KurulumHatirlatmaGonderim> {
  if (!(await kurulumHatirlatmaTablosuVar())) {
    throw new Error(
      "kurulum_hatirlatma_gonderim yok. supabase/migrations/039_kurulum_hatirlatma.sql çalıştırın."
    );
  }
  const telefon = telefonNormalize(opts.telefon);
  const sb = getSupabaseAdmin();
  const mesajIndex = kurulumHatirlatmaMesajIndex(opts.mesajIndex);

  for (let i = 0; i < MAX_TOKEN_DENEME; i++) {
    const token = kurulumHatirlatmaTokenUret();
    const { data, error } = await sb
      .from("kurulum_hatirlatma_gonderim")
      .insert({
        token,
        cekici_id: opts.cekiciId,
        telefon,
        kaynak: opts.kaynak ?? "manuel",
        mesaj_index: mesajIndex,
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
  throw new Error("Benzersiz kurulum hatırlatma token üretilemedi.");
}

export async function isaretleKurulumHatirlatmaSmsSonuc(
  id: string,
  basarili: boolean
): Promise<void> {
  if (!(await kurulumHatirlatmaTablosuVar())) return;
  const { error } = await getSupabaseAdmin()
    .from("kurulum_hatirlatma_gonderim")
    .update({ sms_basarili: basarili })
    .eq("id", id);
  if (error) console.error("[kurulum-hatirlatma] sms sonuc", error.message);
}

export async function getKurulumHatirlatmaByToken(
  token: string
): Promise<KurulumHatirlatmaGonderim | null> {
  if (!kurulumHatirlatmaTokenGecerliMi(token)) return null;
  if (!(await kurulumHatirlatmaTablosuVar())) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("kurulum_hatirlatma_gonderim")
    .select(SELECT_COLS)
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToGonderim(data as Record<string, unknown>);
}

export async function kaydetKurulumHatirlatmaTiklama(
  token: string
): Promise<KurulumHatirlatmaGonderim | null> {
  const kayit = await getKurulumHatirlatmaByToken(token);
  if (!kayit) return null;
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("kurulum_hatirlatma_gonderim")
    .update({
      tiklama_sayisi: kayit.tiklamaSayisi + 1,
      ilk_tiklama: kayit.ilkTiklama ?? now,
    })
    .eq("token", token)
    .select(SELECT_COLS)
    .single();
  if (error) {
    console.error("[kurulum-hatirlatma] tiklama", error.message);
    return kayit;
  }
  return rowToGonderim(data as Record<string, unknown>);
}

/** Kurulum bitince açık hatırlatmaları kapat */
export async function baglaKurulumHatirlatmaTamam(
  cekiciId: string
): Promise<number> {
  if (!(await kurulumHatirlatmaTablosuVar())) return 0;
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("kurulum_hatirlatma_gonderim")
    .update({ kurulum_tamam_at: now })
    .eq("cekici_id", cekiciId)
    .is("kurulum_tamam_at", null)
    .select("id");
  if (error) {
    console.error("[kurulum-hatirlatma] tamam bagla", error.message);
    return 0;
  }
  return data?.length ?? 0;
}

export async function getKurulumHatirlatmaOzetMap(
  cekiciIds?: string[]
): Promise<Map<string, KurulumHatirlatmaCekiciOzet>> {
  const out = new Map<string, KurulumHatirlatmaCekiciOzet>();
  if (!(await kurulumHatirlatmaTablosuVar())) return out;

  let q = getSupabaseAdmin()
    .from("kurulum_hatirlatma_gonderim")
    .select(
      "cekici_id, sms_basarili, olusturulma, ilk_tiklama, kurulum_tamam_at"
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
        tamamlanmamisBasarili: 0,
        sonBasariliAt: null,
        tiklayan: false,
        kurulumTamamlandi: false,
      };
      out.set(id, o);
    }
    if (row.sms_basarili) {
      o.basariliGonderim += 1;
      if (!o.sonBasariliAt) o.sonBasariliAt = String(row.olusturulma);
      if (!row.kurulum_tamam_at) o.tamamlanmamisBasarili += 1;
    }
    if (row.ilk_tiklama) o.tiklayan = true;
    if (row.kurulum_tamam_at) o.kurulumTamamlandi = true;
  }
  return out;
}

export type KurulumHatirlatmaPanelOzet = {
  gonderilen: number;
  tiklayanCekici: number;
  kurulumTamamlayan: number;
  durdurulan: number;
};

export type KurulumHatirlatmaPanelSatir = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  gonderimSayisi: number;
  tamamlanmamisBasarili: number;
  sonSms: string | null;
  tiklayan: boolean;
  kurulumTamamlandi: boolean;
  durum: "aktif" | "durduruldu";
};

export async function getKurulumHatirlatmaPanelVerisi(): Promise<{
  ozet: KurulumHatirlatmaPanelOzet;
  satirlar: KurulumHatirlatmaPanelSatir[];
}> {
  const tumCekiciler = await getCekiciler();
  const byId = new Map(tumCekiciler.map((c) => [c.id, c]));
  const ozetMap = await getKurulumHatirlatmaOzetMap();

  let gonderilen = 0;
  let tiklayanCekici = 0;
  let kurulumTamamlayan = 0;
  let durdurulan = 0;

  const satirlar: KurulumHatirlatmaPanelSatir[] = [];

  for (const [cekiciId, o] of ozetMap) {
    gonderilen += o.basariliGonderim;
    if (o.tiklayan) tiklayanCekici += 1;
    if (o.kurulumTamamlandi) kurulumTamamlayan += 1;
    const durdur = kurulumHatirlatmaDurdurulduMu(o);
    if (durdur) durdurulan += 1;
    const c = byId.get(cekiciId);
    satirlar.push({
      cekiciId,
      ad: c?.ad ?? "—",
      telefon: c?.telefon ?? o.cekiciId,
      kayitFunnel: c?.kayitFunnel ?? null,
      gonderimSayisi: o.basariliGonderim,
      tamamlanmamisBasarili: o.tamamlanmamisBasarili,
      sonSms: o.sonBasariliAt,
      tiklayan: o.tiklayan,
      kurulumTamamlandi: o.kurulumTamamlandi,
      durum: durdur ? "durduruldu" : "aktif",
    });
  }

  satirlar.sort((a, b) => {
    const ta = a.sonSms ? new Date(a.sonSms).getTime() : 0;
    const tb = b.sonSms ? new Date(b.sonSms).getTime() : 0;
    return tb - ta;
  });

  return {
    ozet: {
      gonderilen,
      tiklayanCekici,
      kurulumTamamlayan,
      durdurulan,
    },
    satirlar,
  };
}

async function gonderBirCekiciye(opts: {
  cekici: Cekici;
  basariliGonderim: number;
  baseUrl: string;
}): Promise<{ ok: boolean; token?: string; hata?: string }> {
  try {
    const mesajIndex = kurulumHatirlatmaMesajIndex(opts.basariliGonderim);
    const kayit = await olusturKurulumHatirlatmaGonderim({
      cekiciId: opts.cekici.id,
      telefon: opts.cekici.telefon,
      mesajIndex,
    });
    const url = kurulumHatirlatmaKisaUrl(kayit.token, opts.baseUrl);
    const mesaj = kurulumHatirlatmaSmsMetni(url, opts.basariliGonderim);
    const sonuc = await sendSms(opts.cekici.telefon, mesaj, {
      aliciTipi: "cekici",
      cekiciId: opts.cekici.id,
      link: url,
      krediDus: false,
      kanal: "xml",
    });
    await isaretleKurulumHatirlatmaSmsSonuc(kayit.id, sonuc.basarili);
    if (!sonuc.basarili) {
      return { ok: false, token: kayit.token, hata: sonuc.hata };
    }
    return { ok: true, token: kayit.token };
  } catch (e) {
    const hata = e instanceof Error ? e.message : "Gönderim hatası";
    console.error("[kurulum-hatirlatma] gonder", hata);
    return { ok: false, hata };
  }
}

/** Panel manuel / haftalık gönderim */
export async function manuelKurulumHatirlatmaGonder(opts: {
  cekiciIds: string[];
  baseUrl: string;
  /** false = 7 gün kuralını atla (acil) */
  cooldownUygula?: boolean;
}): Promise<{ gonderilen: number; hatalar: string[] }> {
  if (!(await kurulumHatirlatmaTablosuVar())) {
    throw new Error(
      "kurulum_hatirlatma_gonderim yok. supabase/migrations/039_kurulum_hatirlatma.sql çalıştırın."
    );
  }
  const ozetMap = await getKurulumHatirlatmaOzetMap(opts.cekiciIds);
  const hatalar: string[] = [];
  let gonderilen = 0;

  for (const id of opts.cekiciIds) {
    const cekici = await getCekiciById(id);
    if (!cekici) {
      hatalar.push(`${id}: bulunamadı`);
      continue;
    }
    const o = ozetMap.get(cekici.id) ?? null;
    if (
      !cekiciKurulumHatirlatmaAdayiMi(cekici, o, {
        cooldownUygula: opts.cooldownUygula !== false,
      })
    ) {
      hatalar.push(`${cekici.telefon}: aday değil (kurulum/kural)`);
      continue;
    }
    const r = await gonderBirCekiciye({
      cekici,
      basariliGonderim: o?.basariliGonderim ?? 0,
      baseUrl: opts.baseUrl,
    });
    if (r.ok) {
      gonderilen += 1;
      /* Aynı batch’te tekrar seçilmesin diye özet güncelle */
      const onceki = ozetMap.get(cekici.id);
      ozetMap.set(cekici.id, {
        cekiciId: cekici.id,
        basariliGonderim: (onceki?.basariliGonderim ?? 0) + 1,
        tamamlanmamisBasarili: (onceki?.tamamlanmamisBasarili ?? 0) + 1,
        sonBasariliAt: new Date().toISOString(),
        tiklayan: onceki?.tiklayan ?? false,
        kurulumTamamlandi: onceki?.kurulumTamamlandi ?? false,
      });
    } else {
      hatalar.push(`${cekici.telefon}: ${r.hata ?? "başarısız"}`);
    }
  }

  return { gonderilen, hatalar };
}

export type KurulumHatirlatmaAday = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  kayitTarihi: string;
  gonderimSayisi: number;
  sonrakiMesaj: number;
  durum: "aktif" | "durduruldu";
};

export async function listeleKurulumHatirlatmaAdaylar(opts?: {
  cooldownUygula?: boolean;
}): Promise<KurulumHatirlatmaAday[]> {
  const tum = await getCekiciler();
  const ozetMap = await getKurulumHatirlatmaOzetMap(tum.map((c) => c.id));
  const out: KurulumHatirlatmaAday[] = [];

  for (const c of tum) {
    const o = ozetMap.get(c.id) ?? null;
    if (
      !cekiciKurulumHatirlatmaAdayiMi(c, o, {
        cooldownUygula: opts?.cooldownUygula !== false,
      })
    ) {
      continue;
    }
    const gonderimSayisi = o?.basariliGonderim ?? 0;
    out.push({
      cekiciId: c.id,
      ad: c.ad || "(adsız)",
      telefon: c.telefon,
      kayitFunnel: c.kayitFunnel ?? null,
      kayitTarihi: c.kayitTarihi,
      gonderimSayisi,
      sonrakiMesaj: kurulumHatirlatmaMesajIndex(gonderimSayisi) + 1,
      durum:
        o && kurulumHatirlatmaDurdurulduMu(o) ? "durduruldu" : "aktif",
    });
  }

  out.sort((a, b) => {
    const ta = new Date(a.kayitTarihi).getTime();
    const tb = new Date(b.kayitTarihi).getTime();
    return tb - ta;
  });
  return out;
}
