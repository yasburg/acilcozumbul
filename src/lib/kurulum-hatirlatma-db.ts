import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { getCekiciById, getCekiciler } from "./db";
import {
  cekiciKurulumIlerleme,
  cekiciProfilHazirMi,
} from "./cekici-profil-hazir";
import {
  cekiciKurulumHatirlatmaAdayiMi,
  kurulumHatirlatmaDurdurulduMu,
  kurulumHatirlatmaKisaPath,
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
      "cekici_id, sms_basarili, olusturulma, mesaj_index, ilk_tiklama, tiklama_sayisi, kurulum_tamam_at"
    )
    .order("olusturulma", { ascending: true });

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
        ilkGonderimAt: null,
        sonMesajIndex: null,
        tamamlandigiHatirlatma: null,
        toplamTiklama: 0,
        sonTiklamaAt: null,
        tiklayan: false,
        kurulumTamamlandi: false,
        kurulumTamamAt: null,
      };
      out.set(id, o);
    }
    if (row.sms_basarili) {
      o.basariliGonderim += 1;
      if (!o.ilkGonderimAt) o.ilkGonderimAt = String(row.olusturulma);
      o.sonBasariliAt = String(row.olusturulma);
      o.sonMesajIndex = Number(row.mesaj_index) || 0;
      if (!row.kurulum_tamam_at) o.tamamlanmamisBasarili += 1;
    }
    const tik = Number(row.tiklama_sayisi) || 0;
    if (tik > 0 || row.ilk_tiklama) {
      o.tiklayan = true;
      o.toplamTiklama += tik;
      if (row.ilk_tiklama) {
        const t = String(row.ilk_tiklama);
        if (!o.sonTiklamaAt || t > o.sonTiklamaAt) o.sonTiklamaAt = t;
      }
    }
    if (row.kurulum_tamam_at) {
      o.kurulumTamamlandi = true;
      const tamamAt = String(row.kurulum_tamam_at);
      if (!o.kurulumTamamAt || tamamAt < o.kurulumTamamAt) {
        o.kurulumTamamAt = tamamAt;
      }
    }
  }

  /* Tamamlanma hangi hatırlatmada: son başarılı mesaj indeksi */
  for (const o of out.values()) {
    if (o.kurulumTamamlandi && o.sonMesajIndex != null) {
      o.tamamlandigiHatirlatma = o.sonMesajIndex + 1;
    }
  }

  return out;
}

export type KurulumHatirlatmaPanelOzet = {
  eksikKurulum: number;
  smsAlanCekici: number;
  gonderilen: number;
  basarisizSms: number;
  tiklayanCekici: number;
  tiklamaOrani: number | null;
  kurulumTamamlayan: number;
  smsSonrasiTamam: number;
  donusumOrani: number | null;
  durdurulan: number;
  adaySayisi: number;
  hicSmsAlmayan: number;
};

export type KurulumHatirlatmaMesajKirilim = {
  hatirlatma: number;
  gonderilen: number;
  tiklanan: number;
  tiklamaOrani: number | null;
  tamamlanan: number;
  donusumOrani: number | null;
};

export type KurulumHatirlatmaFunnelKirilim = {
  funnel: string;
  eksik: number;
  smsAlan: number;
  tiklayan: number;
  tamamlayan: number;
};

export type KurulumHatirlatmaPanelSatir = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  kayitTarihi: string | null;
  kurulumYuzde: number;
  gonderimSayisi: number;
  hatirlatmaNo: number;
  sonrakiMesaj: number | null;
  tamamlanmamisBasarili: number;
  ilkSms: string | null;
  sonSms: string | null;
  tiklayan: boolean;
  toplamTiklama: number;
  sonTiklama: string | null;
  kurulumTamamlandi: boolean;
  kurulumTamamAt: string | null;
  tamamlandigiHatirlatma: number | null;
  gunKayittan: number | null;
  gunSonSms: number | null;
  durum:
    | "aday"
    | "bekliyor"
    | "tikladi"
    | "tamamlandi"
    | "durduruldu"
    | "sms_yok";
};

export type KurulumHatirlatmaLogSatir = {
  id: string;
  token: string;
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  hatirlatmaNo: number;
  olusturulma: string;
  smsBasarili: boolean;
  tiklandi: boolean;
  tiklamaSayisi: number;
  ilkTiklama: string | null;
  kurulumTamamAt: string | null;
  kisaPath: string;
};

function oran(pay: number, payda: number): number | null {
  if (payda <= 0) return null;
  return pay / payda;
}

function gunFarki(iso: string | null, nowMs: number): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((nowMs - t) / (24 * 60 * 60 * 1000));
}

function takipDurum(opts: {
  kurulumTamam: boolean;
  durduruldu: boolean;
  gonderimSayisi: number;
  tiklayan: boolean;
  adayMi: boolean;
}): KurulumHatirlatmaPanelSatir["durum"] {
  if (opts.kurulumTamam) return "tamamlandi";
  if (opts.durduruldu) return "durduruldu";
  if (opts.gonderimSayisi === 0) return "sms_yok";
  if (opts.tiklayan) return "tikladi";
  if (opts.adayMi) return "aday";
  return "bekliyor";
}

export async function getKurulumHatirlatmaPanelVerisi(): Promise<{
  ozet: KurulumHatirlatmaPanelOzet;
  mesajKirilim: KurulumHatirlatmaMesajKirilim[];
  funnelKirilim: KurulumHatirlatmaFunnelKirilim[];
  satirlar: KurulumHatirlatmaPanelSatir[];
  gonderimler: KurulumHatirlatmaLogSatir[];
}> {
  const tumCekiciler = await getCekiciler();
  const byId = new Map(tumCekiciler.map((c) => [c.id, c]));
  const ozetMap = await getKurulumHatirlatmaOzetMap();
  const nowMs = Date.now();

  const mesajMap = new Map<
    number,
    { gonderilen: number; tiklanan: number; tamamlanan: number }
  >();
  for (let i = 0; i < 4; i++) {
    mesajMap.set(i, { gonderilen: 0, tiklanan: 0, tamamlanan: 0 });
  }

  const gonderimler: KurulumHatirlatmaLogSatir[] = [];
  let basarisizSms = 0;

  if (await kurulumHatirlatmaTablosuVar()) {
    const { data, error } = await getSupabaseAdmin()
      .from("kurulum_hatirlatma_gonderim")
      .select(SELECT_COLS)
      .order("olusturulma", { ascending: false })
      .limit(500);
    if (error) throw error;

    for (const raw of data ?? []) {
      const g = rowToGonderim(raw as Record<string, unknown>);
      const c = byId.get(g.cekiciId);
      if (!g.smsBasarili) basarisizSms += 1;
      const m = mesajMap.get(g.mesajIndex);
      if (m && g.smsBasarili) {
        m.gonderilen += 1;
        if (g.ilkTiklama || g.tiklamaSayisi > 0) m.tiklanan += 1;
        if (g.kurulumTamamAt) m.tamamlanan += 1;
      }
      gonderimler.push({
        id: g.id,
        token: g.token,
        cekiciId: g.cekiciId,
        ad: c?.ad || "(adsız)",
        telefon: c?.telefon ?? g.telefon,
        kayitFunnel: c?.kayitFunnel ?? null,
        hatirlatmaNo: g.mesajIndex + 1,
        olusturulma: g.olusturulma,
        smsBasarili: g.smsBasarili,
        tiklandi: Boolean(g.ilkTiklama) || g.tiklamaSayisi > 0,
        tiklamaSayisi: g.tiklamaSayisi,
        ilkTiklama: g.ilkTiklama,
        kurulumTamamAt: g.kurulumTamamAt,
        kisaPath: kurulumHatirlatmaKisaPath(g.token),
      });
    }
  }

  const mesajKirilim: KurulumHatirlatmaMesajKirilim[] = [0, 1, 2, 3].map(
    (i) => {
      const m = mesajMap.get(i)!;
      return {
        hatirlatma: i + 1,
        gonderilen: m.gonderilen,
        tiklanan: m.tiklanan,
        tiklamaOrani: oran(m.tiklanan, m.gonderilen),
        tamamlanan: m.tamamlanan,
        donusumOrani: oran(m.tamamlanan, m.gonderilen),
      };
    }
  );

  let gonderilen = 0;
  let tiklayanCekici = 0;
  let kurulumTamamlayan = 0;
  let smsSonrasiTamam = 0;
  let durdurulan = 0;
  let smsAlanCekici = 0;

  const takipIds = new Set<string>();
  for (const c of tumCekiciler) {
    if (c.testerHesap) continue;
    if (c.kurulumTamam === false || ozetMap.has(c.id)) {
      takipIds.add(c.id);
    }
  }
  for (const id of ozetMap.keys()) takipIds.add(id);

  const satirlar: KurulumHatirlatmaPanelSatir[] = [];
  const funnelMap = new Map<
    string,
    { eksik: number; smsAlan: number; tiklayan: number; tamamlayan: number }
  >();

  function funnelSlot(f: string | null | undefined) {
    const key = f && f.trim() ? f.trim().toLowerCase() : "—";
    let s = funnelMap.get(key);
    if (!s) {
      s = { eksik: 0, smsAlan: 0, tiklayan: 0, tamamlayan: 0 };
      funnelMap.set(key, s);
    }
    return s;
  }

  let eksikKurulum = 0;
  let hicSmsAlmayan = 0;

  for (const cekiciId of takipIds) {
    const c = byId.get(cekiciId);
    const o = ozetMap.get(cekiciId) ?? null;
    const kurulumEksik = c?.kurulumTamam === false && !cekiciProfilHazirMi(c);
    const gonderimSayisi = o?.basariliGonderim ?? 0;
    const durdur = o ? kurulumHatirlatmaDurdurulduMu(o) : false;
    const adayMi = c
      ? cekiciKurulumHatirlatmaAdayiMi(c, o, { cooldownUygula: true, nowMs })
      : false;

    if (kurulumEksik) {
      eksikKurulum += 1;
      if (gonderimSayisi === 0) hicSmsAlmayan += 1;
    }
    if (gonderimSayisi > 0) smsAlanCekici += 1;
    if (o) {
      gonderilen += o.basariliGonderim;
      if (o.tiklayan) tiklayanCekici += 1;
      if (o.kurulumTamamlandi) {
        kurulumTamamlayan += 1;
        if (o.basariliGonderim > 0) smsSonrasiTamam += 1;
      }
      if (durdur) durdurulan += 1;
    }

    const fKey = c?.kayitFunnel ?? null;
    const fs = funnelSlot(fKey);
    if (kurulumEksik) fs.eksik += 1;
    if (gonderimSayisi > 0) fs.smsAlan += 1;
    if (o?.tiklayan) fs.tiklayan += 1;
    if (o?.kurulumTamamlandi) fs.tamamlayan += 1;

    const kurulumTamam =
      o?.kurulumTamamlandi === true ||
      (c != null && c.kurulumTamam !== false && !kurulumEksik);
    const ilerleme = c ? cekiciKurulumIlerleme(c) : { yuzde: 0, adimlar: [] };
    const hatirlatmaNo = kurulumTamam
      ? (o?.tamamlandigiHatirlatma ?? gonderimSayisi)
      : gonderimSayisi;
    const sonraki =
      !kurulumTamam && !durdur && gonderimSayisi < 4
        ? kurulumHatirlatmaMesajIndex(gonderimSayisi) + 1
        : null;

    satirlar.push({
      cekiciId,
      ad: c?.ad || "(adsız)",
      telefon: c?.telefon ?? cekiciId,
      kayitFunnel: c?.kayitFunnel ?? null,
      kayitTarihi: c?.kayitTarihi ?? null,
      kurulumYuzde: ilerleme.yuzde,
      gonderimSayisi,
      hatirlatmaNo,
      sonrakiMesaj: sonraki,
      tamamlanmamisBasarili: o?.tamamlanmamisBasarili ?? 0,
      ilkSms: o?.ilkGonderimAt ?? null,
      sonSms: o?.sonBasariliAt ?? null,
      tiklayan: o?.tiklayan ?? false,
      toplamTiklama: o?.toplamTiklama ?? 0,
      sonTiklama: o?.sonTiklamaAt ?? null,
      kurulumTamamlandi: kurulumTamam,
      kurulumTamamAt: o?.kurulumTamamAt ?? null,
      tamamlandigiHatirlatma: o?.tamamlandigiHatirlatma ?? null,
      gunKayittan: gunFarki(c?.kayitTarihi ?? null, nowMs),
      gunSonSms: gunFarki(o?.sonBasariliAt ?? null, nowMs),
      durum: takipDurum({
        kurulumTamam,
        durduruldu: durdur,
        gonderimSayisi,
        tiklayan: o?.tiklayan ?? false,
        adayMi,
      }),
    });
  }

  satirlar.sort((a, b) => {
    const ta = a.sonSms
      ? new Date(a.sonSms).getTime()
      : a.kayitTarihi
        ? new Date(a.kayitTarihi).getTime()
        : 0;
    const tb = b.sonSms
      ? new Date(b.sonSms).getTime()
      : b.kayitTarihi
        ? new Date(b.kayitTarihi).getTime()
        : 0;
    return tb - ta;
  });

  const funnelKirilim: KurulumHatirlatmaFunnelKirilim[] = [
    ...funnelMap.entries(),
  ]
    .map(([funnel, v]) => ({ funnel, ...v }))
    .sort((a, b) => b.eksik - a.eksik || b.smsAlan - a.smsAlan);

  const adaylar = await listeleKurulumHatirlatmaAdaylar({
    cooldownUygula: true,
  });

  return {
    ozet: {
      eksikKurulum,
      smsAlanCekici,
      gonderilen,
      basarisizSms,
      tiklayanCekici,
      tiklamaOrani: oran(tiklayanCekici, smsAlanCekici),
      kurulumTamamlayan,
      smsSonrasiTamam,
      donusumOrani: oran(smsSonrasiTamam, smsAlanCekici),
      durdurulan,
      adaySayisi: adaylar.length,
      hicSmsAlmayan,
    },
    mesajKirilim,
    funnelKirilim,
    satirlar,
    gonderimler,
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
        ilkGonderimAt: onceki?.ilkGonderimAt ?? new Date().toISOString(),
        sonMesajIndex: kurulumHatirlatmaMesajIndex(
          onceki?.basariliGonderim ?? 0
        ),
        tamamlandigiHatirlatma: onceki?.tamamlandigiHatirlatma ?? null,
        toplamTiklama: onceki?.toplamTiklama ?? 0,
        sonTiklamaAt: onceki?.sonTiklamaAt ?? null,
        tiklayan: onceki?.tiklayan ?? false,
        kurulumTamamlandi: onceki?.kurulumTamamlandi ?? false,
        kurulumTamamAt: onceki?.kurulumTamamAt ?? null,
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
