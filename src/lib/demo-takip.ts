/**
 * Panel demo başladıktan 1 dakika sonra: yalnızca o çekiciye gerçek talep + SMS + sesli.
 */

import { randomUUID } from "crypto";
import { addTalep, getCekiciById, getTalepById, updateTalep } from "./db";
import { cekiciHizmetBolgeleri } from "./cekici-hizmet-bolge";
import { IHALE_SURE_DK } from "./ihale";
import { notifyCekiciler } from "./sms";
import {
  konumIlIlce,
  rastgeleMusteriKimlik,
  simulasyonSorunMetni,
  type SimulasyonSorunTipi,
} from "./simulasyon-ihale";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import type { Cekici, Talep } from "./types";

export type DemoTakipPlanDurum = "planli" | "acildi" | "iptal" | "hata";

export type DemoTakipPlan = {
  id: string;
  cekiciId: string;
  demoOturumId: string | null;
  planlananAcilisAt: string;
  durum: DemoTakipPlanDurum;
  talepId: string | null;
  hataMesaj: string | null;
  olusturulma: string;
  guncelleme: string;
};

type PlanRow = {
  id: string;
  cekici_id: string;
  demo_oturum_id: string | null;
  planlanan_acilis_at: string;
  durum: string;
  talep_id: string | null;
  hata_mesaj: string | null;
  olusturulma: string;
  guncelleme: string;
};

const BIR_DAKIKA_MS = 60_000;

/** DEMO_TAKIP_GECIKME_MS (ms) ile override; yoksa 1 dakika */
export function demoTakipGecikmeMs(): number {
  const ham = process.env.DEMO_TAKIP_GECIKME_MS?.trim();
  if (ham && /^\d+$/.test(ham)) {
    const n = Number(ham);
    if (n >= 10_000) return n; // en az 10 sn
  }
  return BIR_DAKIKA_MS;
}

function fromRow(r: PlanRow): DemoTakipPlan {
  return {
    id: r.id,
    cekiciId: r.cekici_id,
    demoOturumId: r.demo_oturum_id,
    planlananAcilisAt: String(r.planlanan_acilis_at),
    durum: r.durum as DemoTakipPlanDurum,
    talepId: r.talep_id,
    hataMesaj: r.hata_mesaj,
    olusturulma: String(r.olusturulma),
    guncelleme: String(r.guncelleme),
  };
}

function ilceForCekici(cekici: Cekici): string {
  const bolgeler = cekiciHizmetBolgeleri(cekici);
  const ilceler = bolgeler[cekici.sehir];
  if (ilceler?.length) return ilceler[0]!;
  return "Merkez";
}

export function demoTakipTalepOlustur(opts: {
  cekici: Cekici;
  talepId: string;
  olusturulma?: Date;
}): Talep {
  const simdi = opts.olusturulma ?? new Date();
  const { ad, soyad, telefon } = rastgeleMusteriKimlik();
  const il = opts.cekici.sehir || "İstanbul";
  const ilce = ilceForCekici(opts.cekici);
  const sorunTipi: SimulasyonSorunTipi = "ariza";
  const ihaleBitis = new Date(
    simdi.getTime() + IHALE_SURE_DK * 60 * 1000
  ).toISOString();

  return {
    id: opts.talepId,
    ad,
    soyad,
    telefon,
    konum: konumIlIlce(il, ilce),
    konumIl: il,
    konumIlce: ilce,
    sorun: simulasyonSorunMetni(sorunTipi),
    sorunTipi,
    sorunDetay: "Demo takip: araç yolda kaldı, yardım bekliyorum.",
    aracModeli: "Renault Clio",
    durum: "ihalede",
    olusturulma: simdi.toISOString(),
    ihaleBitis,
    bildirilenCekiciIds: [],
    teklifler: [],
    hedefBilinmiyor: true,
    memnuniyetSmsGonderildi: true,
    yalnizCekiciId: opts.cekici.id,
  };
}

/** Aynı çekicinin bekleyen planlarını iptal et, yenisini yaz */
export async function demoTakipPlanla(opts: {
  cekiciId: string;
  demoOturumId?: string | null;
  simdi?: Date;
}): Promise<DemoTakipPlan | null> {
  if (!supabaseDbAktif()) return null;

  const simdi = opts.simdi ?? new Date();
  const acilis = new Date(simdi.getTime() + demoTakipGecikmeMs());
  const nowIso = simdi.toISOString();

  try {
    await getSupabaseAdmin()
      .from("demo_takip_plan")
      .update({
        durum: "iptal",
        guncelleme: nowIso,
        hata_mesaj: "Yeni demo ile iptal",
      })
      .eq("cekici_id", opts.cekiciId)
      .eq("durum", "planli");

    const kayit: PlanRow = {
      id: randomUUID(),
      cekici_id: opts.cekiciId,
      demo_oturum_id: opts.demoOturumId ?? null,
      planlanan_acilis_at: acilis.toISOString(),
      durum: "planli",
      talep_id: null,
      hata_mesaj: null,
      olusturulma: nowIso,
      guncelleme: nowIso,
    };

    const { data, error } = await getSupabaseAdmin()
      .from("demo_takip_plan")
      .insert(kayit)
      .select("*")
      .single();
    if (error) {
      if (error.code === "42P01" || error.message?.includes("demo_takip_plan")) {
        console.warn("[demo-takip] tablo yok — migration 070 gerekli");
        return null;
      }
      throw error;
    }
    return fromRow(data as PlanRow);
  } catch (e) {
    console.error("[demo-takip] planla", e);
    return null;
  }
}

async function planGuncelle(
  id: string,
  patch: Partial<PlanRow>
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("demo_takip_plan")
    .update({ ...patch, guncelleme: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function demoTakipPlanAc(
  plan: DemoTakipPlan,
  baseUrl: string,
  opts?: { simdi?: Date }
): Promise<{ talepId: string }> {
  const cekici = await getCekiciById(plan.cekiciId);
  if (!cekici) {
    await planGuncelle(plan.id, {
      durum: "hata",
      hata_mesaj: "Çekici bulunamadı",
    });
    throw new Error("Çekici bulunamadı");
  }

  const simdi = opts?.simdi ?? new Date();
  const talepId = randomUUID();
  const talep = demoTakipTalepOlustur({ cekici, talepId, olusturulma: simdi });
  await addTalep(talep);

  try {
    const ids = await notifyCekiciler(talep, baseUrl, [], {
      yalnizCekiciIds: [cekici.id],
    });
    const guncel = await getTalepById(talepId);
    if (guncel) {
      guncel.bildirilenCekiciIds = ids.length ? ids : [cekici.id];
      guncel.yalnizCekiciId = cekici.id;
      await updateTalep(guncel);
    }
  } catch (e) {
    console.error("[demo-takip] notify", plan.id, e);
  }

  await planGuncelle(plan.id, {
    durum: "acildi",
    talep_id: talepId,
    hata_mesaj: null,
  });

  return { talepId };
}

/** Cron: vadesi gelen planlı takip taleplerini aç */
export async function demoTakipPlanlariCalistir(opts: {
  baseUrl: string;
  simdi?: Date;
}): Promise<{ acilan: number; hatalar: string[] }> {
  if (!supabaseDbAktif()) return { acilan: 0, hatalar: [] };

  const simdi = opts.simdi ?? new Date();
  let acilan = 0;
  const hatalar: string[] = [];

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("demo_takip_plan")
      .select("*")
      .eq("durum", "planli")
      .lte("planlanan_acilis_at", simdi.toISOString())
      .order("planlanan_acilis_at", { ascending: true })
      .limit(20);

    if (error) {
      if (error.code === "42P01" || error.message?.includes("demo_takip_plan")) {
        return { acilan: 0, hatalar: [] };
      }
      throw error;
    }

    for (const row of (data ?? []) as PlanRow[]) {
      const plan = fromRow(row);
      try {
        await demoTakipPlanAc(plan, opts.baseUrl, { simdi });
        acilan += 1;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        hatalar.push(`${plan.id}:${msg}`);
        await planGuncelle(plan.id, {
          durum: "hata",
          hata_mesaj: msg.slice(0, 500),
        }).catch(() => undefined);
      }
    }
  } catch (e) {
    hatalar.push(e instanceof Error ? e.message : String(e));
  }

  return { acilan, hatalar };
}
