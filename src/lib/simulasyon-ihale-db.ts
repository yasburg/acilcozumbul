import { randomUUID } from "crypto";
import { addCekici, addTalep, getCekiciById, getCekiciler, getTalepById, updateTalep } from "./db";
import { getAcikIller } from "./cekici-sehir-acilis-db";
import { istanbulGunAnahtari } from "./musteri-otp";
import { notifyCekiciler } from "./sms";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { insertTeklif, setKaybedenTeklifler, updateTeklifDurum } from "./teklif-db";
import type { Teklif } from "./types";
import {
  rastgeleKapanisAt,
  sehirAktifCekiciSayisi,
  SIMULASYON_GHOST_AD,
  SIMULASYON_GHOST_CEKICI_ID,
  simulasyonGunlukAdet,
  simulasyonSlotUret,
  simulasyonTalepOlustur,
  istanbulYarinAnahtari,
  type SimulasyonPlan,
  type SimulasyonPlanDurum,
  type SimulasyonSorunTipi,
} from "./simulasyon-ihale";

type PlanRow = {
  id: string;
  hedef_gun: string;
  il: string;
  kaynak_ilce: string;
  hedef_ilce: string | null;
  sorun_tipi: string;
  planlanan_acilis_at: string;
  ihale_bitis_at: string;
  planlanan_kapanis_at: string | null;
  durum: string;
  talep_id: string | null;
  adet_snapshot: number | null;
  cekici_sayisi_snapshot: number;
  olusturma_kaynagi: string;
  hata_mesaj: string | null;
  olusturulma: string;
  guncelleme: string;
};

function planFromRow(r: PlanRow): SimulasyonPlan {
  return {
    id: r.id,
    hedefGun: String(r.hedef_gun).slice(0, 10),
    il: r.il,
    kaynakIlce: r.kaynak_ilce,
    hedefIlce: r.hedef_ilce,
    sorunTipi: r.sorun_tipi as SimulasyonSorunTipi,
    planlananAcilisAt: r.planlanan_acilis_at,
    ihaleBitisAt: r.ihale_bitis_at,
    planlananKapanisAt: r.planlanan_kapanis_at,
    durum: r.durum as SimulasyonPlanDurum,
    talepId: r.talep_id,
    adetSnapshot: r.adet_snapshot,
    cekiciSayisiSnapshot: Number(r.cekici_sayisi_snapshot) || 0,
    olusturmaKaynagi: r.olusturma_kaynagi === "manuel" ? "manuel" : "cron",
    hataMesaj: r.hata_mesaj,
    olusturulma: r.olusturulma,
    guncelleme: r.guncelleme,
  };
}

function planToRow(p: SimulasyonPlan): PlanRow {
  return {
    id: p.id,
    hedef_gun: p.hedefGun,
    il: p.il,
    kaynak_ilce: p.kaynakIlce,
    hedef_ilce: p.hedefIlce,
    sorun_tipi: p.sorunTipi,
    planlanan_acilis_at: p.planlananAcilisAt,
    ihale_bitis_at: p.ihaleBitisAt,
    planlanan_kapanis_at: p.planlananKapanisAt,
    durum: p.durum,
    talep_id: p.talepId,
    adet_snapshot: p.adetSnapshot,
    cekici_sayisi_snapshot: p.cekiciSayisiSnapshot,
    olusturma_kaynagi: p.olusturmaKaynagi,
    hata_mesaj: p.hataMesaj,
    olusturulma: p.olusturulma,
    guncelleme: p.guncelleme,
  };
}

export async function ensureSimulasyonGhostCekici(): Promise<void> {
  if (!supabaseDbAktif()) return;
  const mevcut = await getCekiciById(SIMULASYON_GHOST_CEKICI_ID);
  if (mevcut) return;
  try {
    await addCekici({
      id: SIMULASYON_GHOST_CEKICI_ID,
      ad: SIMULASYON_GHOST_AD,
      telefon: "05990000001",
      token: "simulasyon-ghost-token-do-not-use",
      sifre: "",
      kredi: 0,
      sehir: "İstanbul",
      hizmetIlceleri: [],
      hizmetBolgeleri: {},
      hizmetModu: "il_ilce",
      hizmetSorunTipleri: [],
      aktif: false,
      kayitTarihi: new Date().toISOString(),
      testerHesap: true,
      kurulumTamam: true,
    });
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "23505") throw e;
  }
}

export async function listSimulasyonPlanlar(opts?: {
  hedefGun?: string;
  durumlar?: SimulasyonPlanDurum[];
}): Promise<SimulasyonPlan[]> {
  if (!supabaseDbAktif()) return [];
  let q = getSupabaseAdmin()
    .from("simulasyon_plan")
    .select("*")
    .order("planlanan_acilis_at", { ascending: true });
  if (opts?.hedefGun) q = q.eq("hedef_gun", opts.hedefGun);
  if (opts?.durumlar?.length) q = q.in("durum", opts.durumlar);
  const { data, error } = await q;
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }
  return ((data ?? []) as PlanRow[]).map(planFromRow);
}

export async function getSimulasyonPlanById(
  id: string
): Promise<SimulasyonPlan | null> {
  if (!supabaseDbAktif()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("simulasyon_plan")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return null;
    throw error;
  }
  return data ? planFromRow(data as PlanRow) : null;
}

export async function updateSimulasyonPlan(
  plan: SimulasyonPlan
): Promise<void> {
  plan.guncelleme = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from("simulasyon_plan")
    .update(planToRow(plan))
    .eq("id", plan.id);
  if (error) throw error;
}

async function insertPlanlar(planlar: SimulasyonPlan[]): Promise<void> {
  if (planlar.length === 0) return;
  const { error } = await getSupabaseAdmin()
    .from("simulasyon_plan")
    .insert(planlar.map(planToRow));
  if (error) throw error;
}

export async function isSimulasyonTalep(talepId: string): Promise<boolean> {
  if (!supabaseDbAktif()) return false;
  const { data, error } = await getSupabaseAdmin()
    .from("simulasyon_talep")
    .select("talep_id")
    .eq("talep_id", talepId)
    .maybeSingle();
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return false;
    throw error;
  }
  return Boolean(data);
}

export async function simulasyonTalepIdSet(
  talepIds: string[]
): Promise<Set<string>> {
  const out = new Set<string>();
  if (!supabaseDbAktif() || talepIds.length === 0) return out;
  const { data, error } = await getSupabaseAdmin()
    .from("simulasyon_talep")
    .select("talep_id")
    .in("talep_id", talepIds);
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return out;
    throw error;
  }
  for (const r of data ?? []) {
    out.add(String((r as { talep_id: string }).talep_id));
  }
  return out;
}

/**
 * Hedef gün için plan üret.
 * `forceIl` / `iller` verilirse yalnızca o iller için üretir.
 * Aksi halde gün için hiç plan yoksa tüm açık iller için üretir.
 */
export async function simulasyonGunPlanla(opts?: {
  hedefGun?: string;
  kaynagi?: "cron" | "manuel";
  forceIl?: string;
  /** Belirli iller için plan üret (açık illerle kesişim) */
  iller?: string[];
  /** true: gün için kayıt olsa bile (iller yokken) yeni plan ekler */
  force?: boolean;
  rand?: () => number;
}): Promise<{ hedefGun: string; eklenen: number; atlandi: boolean }> {
  if (!supabaseDbAktif()) {
    return { hedefGun: opts?.hedefGun ?? istanbulYarinAnahtari(), eklenen: 0, atlandi: true };
  }

  await ensureSimulasyonGhostCekici();

  const hedefGun = opts?.hedefGun ?? istanbulYarinAnahtari();
  const kaynagi = opts?.kaynagi ?? "cron";
  const rand = opts?.rand ?? Math.random;

  const seciliIller = [
    ...new Set(
      [
        ...(opts?.iller ?? []),
        ...(opts?.forceIl ? [opts.forceIl] : []),
      ]
        .map((il) => il.trim())
        .filter(Boolean)
    ),
  ];

  /* İl yenile: o ilin planlı satırlarını silip yeniden üret */
  if (opts?.forceIl) {
    const { error } = await getSupabaseAdmin()
      .from("simulasyon_plan")
      .delete()
      .eq("hedef_gun", hedefGun)
      .eq("il", opts.forceIl)
      .eq("durum", "planli");
    if (error && error.code !== "42P01" && error.code !== "PGRST205") {
      throw error;
    }
  } else if (seciliIller.length === 0 && !opts?.force) {
    const mevcut = await listSimulasyonPlanlar({ hedefGun });
    if (mevcut.length > 0) {
      return { hedefGun, eklenen: 0, atlandi: true };
    }
  }

  const acikIller = await getAcikIller();
  const cekiciler = await getCekiciler();
  const iller =
    seciliIller.length > 0
      ? acikIller.filter((il) => seciliIller.includes(il))
      : acikIller;

  const nowIso = new Date().toISOString();
  const yeni: SimulasyonPlan[] = [];

  for (const il of iller) {
    const sayi = sehirAktifCekiciSayisi(cekiciler, il);
    const adet = simulasyonGunlukAdet(sayi, rand);
    for (let i = 0; i < adet; i++) {
      const slot = simulasyonSlotUret({
        il,
        cekiciSayisi: sayi,
        adetSnapshot: adet,
        hedefGun,
        rand,
      });
      if (!slot) continue;
      yeni.push({
        id: randomUUID(),
        hedefGun,
        il: slot.il,
        kaynakIlce: slot.kaynakIlce,
        hedefIlce: slot.hedefIlce,
        sorunTipi: slot.sorunTipi,
        planlananAcilisAt: slot.planlananAcilisAt,
        ihaleBitisAt: slot.ihaleBitisAt,
        planlananKapanisAt: null,
        durum: "planli",
        talepId: null,
        adetSnapshot: slot.adetSnapshot,
        cekiciSayisiSnapshot: slot.cekiciSayisiSnapshot,
        olusturmaKaynagi: kaynagi,
        hataMesaj: null,
        olusturulma: nowIso,
        guncelleme: nowIso,
      });
    }
  }

  await insertPlanlar(yeni);
  return { hedefGun, eklenen: yeni.length, atlandi: false };
}

export async function simulasyonPlanAc(
  plan: SimulasyonPlan,
  baseUrl: string,
  opts?: { rand?: () => number; simdi?: Date }
): Promise<{ talepId: string }> {
  await ensureSimulasyonGhostCekici();
  const simdi = opts?.simdi ?? new Date();
  const rand = opts?.rand ?? Math.random;

  const talepId = randomUUID();
  const talep = simulasyonTalepOlustur({
    plan,
    talepId,
    olusturulma: simdi,
    rand,
  });
  // Plan ihale bitişi açılış anına göre yeniden (acil 60 dk)
  const ihaleBitis = new Date(simdi.getTime() + 60 * 60 * 1000);
  talep.ihaleBitis = ihaleBitis.toISOString();

  const kapanis = rastgeleKapanisAt(simdi, ihaleBitis, rand);

  const bildirilenIds = await notifyCekiciler(talep, baseUrl);
  talep.bildirilenCekiciIds = bildirilenIds;

  await addTalep(talep);

  const { error: sideErr } = await getSupabaseAdmin()
    .from("simulasyon_talep")
    .insert({
      talep_id: talepId,
      plan_id: plan.id,
      planlanan_kapanis_at: kapanis.toISOString(),
      kapanis_at: null,
    });
  if (sideErr) throw sideErr;

  plan.durum = "acildi";
  plan.talepId = talepId;
  plan.planlananKapanisAt = kapanis.toISOString();
  plan.ihaleBitisAt = ihaleBitis.toISOString();
  plan.hataMesaj = null;
  await updateSimulasyonPlan(plan);

  return { talepId };
}

/** Hayalet kazanan ile kapat — puan/SMS yok */
export async function simulasyonIhaleyiKapat(
  talepId: string,
  opts?: { simdi?: Date }
): Promise<boolean> {
  const simdi = opts?.simdi ?? new Date();
  const talep = await getTalepById(talepId);
  if (!talep) return false;
  if (talep.durum === "anlaşıldı" || talep.durum === "iptal") return false;
  if (talep.kazananCekiciId && talep.kazananCekiciId !== SIMULASYON_GHOST_CEKICI_ID) {
    // Gerçek kazanan olmamalı; yine de hayalete çevirme — güvenlik
    return false;
  }

  await ensureSimulasyonGhostCekici();

  const teklifId = randomUUID();
  const fiyat =
    talep.teklifler
      ?.filter((t) => t.cekiciId !== SIMULASYON_GHOST_CEKICI_ID)
      .reduce((min, t) => Math.min(min, t.fiyat), Number.POSITIVE_INFINITY) ??
    1500;
  const ghostFiyat =
    Number.isFinite(fiyat) && fiyat < Number.POSITIVE_INFINITY
      ? Math.max(100, Math.round(fiyat * 0.95))
      : 1500;

  const teklif: Teklif = {
    id: teklifId,
    cekiciId: SIMULASYON_GHOST_CEKICI_ID,
    cekiciAd: SIMULASYON_GHOST_AD,
    fiyat: ghostFiyat,
    ilkFiyat: ghostFiyat,
    tahminiSureDk: 30,
    tarih: simdi.toISOString(),
    durum: "kazandi",
  };

  await insertTeklif(talepId, teklif);

  for (const t of talep.teklifler ?? []) {
    if (t.durum === "aktif") t.durum = "kaybetti";
  }
  talep.teklifler = [...(talep.teklifler ?? []), teklif];
  talep.kazananCekiciId = SIMULASYON_GHOST_CEKICI_ID;
  talep.kazananTeklifId = teklifId;
  talep.durum = "anlaşıldı";
  talep.anlasmaDurumu = "anlaşıldı";
  talep.anlasildiAt = simdi.toISOString();
  talep.memnuniyetSmsGonderildi = true;

  await updateTalep(talep);
  try {
    await updateTeklifDurum(teklifId, "kazandi");
    await setKaybedenTeklifler(talepId, teklifId);
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "42P01" && code !== "PGRST205") throw e;
  }

  const { error } = await getSupabaseAdmin()
    .from("simulasyon_talep")
    .update({ kapanis_at: simdi.toISOString() })
    .eq("talep_id", talepId);
  if (error && error.code !== "42P01" && error.code !== "PGRST205") {
    throw error;
  }

  const { data: planRow } = await getSupabaseAdmin()
    .from("simulasyon_plan")
    .select("*")
    .eq("talep_id", talepId)
    .maybeSingle();
  if (planRow) {
    const plan = planFromRow(planRow as PlanRow);
    plan.durum = "kapandi";
    await updateSimulasyonPlan(plan);
  }

  return true;
}

export async function simulasyonAcilacakPlanlar(
  simdi: Date = new Date()
): Promise<SimulasyonPlan[]> {
  if (!supabaseDbAktif()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("simulasyon_plan")
    .select("*")
    .eq("durum", "planli")
    .lte("planlanan_acilis_at", simdi.toISOString())
    .order("planlanan_acilis_at", { ascending: true })
    .limit(50);
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }
  return ((data ?? []) as PlanRow[]).map(planFromRow);
}

export async function simulasyonKapanacakTalepler(
  simdi: Date = new Date()
): Promise<{ talepId: string; planlananKapanisAt: string | null }[]> {
  if (!supabaseDbAktif()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("simulasyon_talep")
    .select("talep_id, planlanan_kapanis_at")
    .is("kapanis_at", null)
    .limit(100);
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }

  const adaylar = (data ?? []) as {
    talep_id: string;
    planlanan_kapanis_at: string | null;
  }[];

  const sonuc: { talepId: string; planlananKapanisAt: string | null }[] = [];
  for (const a of adaylar) {
    const talep = await getTalepById(a.talep_id);
    if (!talep) continue;
    if (talep.durum === "anlaşıldı" || talep.durum === "iptal") continue;
    if (talep.kazananCekiciId && talep.kazananCekiciId !== SIMULASYON_GHOST_CEKICI_ID) {
      continue;
    }

    const kapanisMs = a.planlanan_kapanis_at
      ? new Date(a.planlanan_kapanis_at).getTime()
      : NaN;
    const bitisMs = new Date(talep.ihaleBitis).getTime();
    const due =
      (Number.isFinite(kapanisMs) && kapanisMs <= simdi.getTime()) ||
      bitisMs <= simdi.getTime();
    if (due) {
      sonuc.push({
        talepId: a.talep_id,
        planlananKapanisAt: a.planlanan_kapanis_at,
      });
    }
  }
  return sonuc;
}

/** Cron: aç + kapat */
export async function simulasyonCalistir(opts: {
  baseUrl: string;
  simdi?: Date;
}): Promise<{ acilan: number; kapanan: number; hatalar: string[] }> {
  const simdi = opts.simdi ?? new Date();
  const hatalar: string[] = [];
  let acilan = 0;
  let kapanan = 0;

  const acilacak = await simulasyonAcilacakPlanlar(simdi);
  for (const plan of acilacak) {
    try {
      await simulasyonPlanAc(plan, opts.baseUrl, { simdi });
      acilan += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      hatalar.push(`ac:${plan.id}:${msg}`);
      plan.durum = "hata";
      plan.hataMesaj = msg.slice(0, 500);
      try {
        await updateSimulasyonPlan(plan);
      } catch {
        /* ignore */
      }
    }
  }

  const kapanacak = await simulasyonKapanacakTalepler(simdi);
  for (const k of kapanacak) {
    try {
      const ok = await simulasyonIhaleyiKapat(k.talepId, { simdi });
      if (ok) kapanan += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      hatalar.push(`kap:${k.talepId}:${msg}`);
    }
  }

  return { acilan, kapanan, hatalar };
}

export function panelHedefGunler(simdi: Date = new Date()): {
  bugun: string;
  yarin: string;
} {
  return {
    bugun: istanbulGunAnahtari(simdi),
    yarin: istanbulYarinAnahtari(simdi),
  };
}
