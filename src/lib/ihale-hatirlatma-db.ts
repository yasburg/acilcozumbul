import { getCekiciler, getTaleplerAcikIhale } from "./db";
import {
  cekiciIhaleHatirlatmaAdayiMi,
  cekiciIhaleHatirlatmaSmsMetni,
  ihaleHatirlatmaAdimiVadesiGeldiMi,
  ihaleHatirlatmaUygunMu,
  musteriIhaleHatirlatmaSmsMetni,
  type IhaleHatirlatmaAdim,
  IHALE_HATIRLATMA_ADIM_SAYISI,
} from "./ihale-hatirlatma";
import { isSimulasyonTalep } from "./simulasyon-ihale-db";
import { cekiciTalepSmsHazirla, smsYalnizTesterCekicilerMi } from "./sms";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  olusturTopluSmsIsi,
  tetikleTopluSmsKuyruk,
} from "./toplu-sms-is-db";
import { TOPLU_SMS_TEMPO_VARSAYILAN } from "./toplu-sms-tempo";
import type { Cekici, Talep } from "./types";

const ADIMLAR: IhaleHatirlatmaAdim[] = [1, 2, 3];

export type IhaleHatirlatmaCronOzet = {
  talepIncelenen: number;
  musteriGonderilen: number;
  cekiciGonderilen: number;
  atlanan: number;
  hatalar: string[];
};

async function hatirlatmaGonderildiMi(
  talepId: string,
  adim: IhaleHatirlatmaAdim,
  hedef: "musteri" | "cekici"
): Promise<boolean> {
  if (!supabaseDbAktif()) return true;
  const { data, error } = await getSupabaseAdmin()
    .from("ihale_hatirlatma")
    .select("id")
    .eq("talep_id", talepId)
    .eq("adim", adim)
    .eq("hedef", hedef)
    .maybeSingle();
  if (error) {
    if (/ihale_hatirlatma|schema cache|does not exist/i.test(error.message)) {
      console.error("[ihale-hatirlatma] tablo yok — 058 migration gerekli");
      return true;
    }
    throw error;
  }
  return Boolean(data);
}

async function hatirlatmaKaydet(opts: {
  talepId: string;
  adim: IhaleHatirlatmaAdim;
  hedef: "musteri" | "cekici";
  topluSmsIsId: string | null;
  aliciSayisi: number;
}): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("ihale_hatirlatma").insert({
    talep_id: opts.talepId,
    adim: opts.adim,
    hedef: opts.hedef,
    toplu_sms_is_id: opts.topluSmsIsId,
    alici_sayisi: opts.aliciSayisi,
  });
  if (error) {
    if (error.code === "23505") return false;
    throw error;
  }
  return true;
}

async function musteriHatirlatmaGonder(
  talep: Talep,
  adim: IhaleHatirlatmaAdim,
  baseUrl: string
): Promise<{ ok: boolean; isId?: string }> {
  if (await hatirlatmaGonderildiMi(talep.id, adim, "musteri")) {
    return { ok: false };
  }
  const { mesaj } = musteriIhaleHatirlatmaSmsMetni(talep, baseUrl);
  const is = await olusturTopluSmsIsi({
    gonderenEposta: "cron:ihale-hatirlatma",
    mesaj,
    tempo: { ...TOPLU_SMS_TEMPO_VARSAYILAN, partiBoyutu: 1, beklemeSn: 0 },
    alicilar: [{ telefon: talep.telefon, ad: `${talep.ad} ${talep.soyad}`.trim() }],
  });
  const kayit = await hatirlatmaKaydet({
    talepId: talep.id,
    adim,
    hedef: "musteri",
    topluSmsIsId: is.id,
    aliciSayisi: 1,
  });
  if (!kayit) return { ok: false };
  return { ok: true, isId: is.id };
}

async function cekiciHatirlatmaGonder(
  talep: Talep,
  adim: IhaleHatirlatmaAdim,
  cekiciler: Cekici[],
  baseUrl: string,
  now: Date
): Promise<{ ok: boolean; isId?: string; alici: number }> {
  if (await hatirlatmaGonderildiMi(talep.id, adim, "cekici")) {
    return { ok: false, alici: 0 };
  }

  let adaylar = cekiciler.filter((c) =>
    cekiciIhaleHatirlatmaAdayiMi(talep, c, now)
  );
  if (smsYalnizTesterCekicilerMi()) {
    adaylar = adaylar.filter((c) => c.testerHesap);
  }
  if (adaylar.length === 0) {
    await hatirlatmaKaydet({
      talepId: talep.id,
      adim,
      hedef: "cekici",
      topluSmsIsId: null,
      aliciSayisi: 0,
    });
    return { ok: false, alici: 0 };
  }

  const alicilar: Array<{ telefon: string; ad?: string; mesaj: string }> = [];
  for (const c of adaylar) {
    try {
      const { link } = await cekiciTalepSmsHazirla(talep, c, baseUrl, false);
      alicilar.push({
        telefon: c.telefon,
        ad: c.ad,
        mesaj: cekiciIhaleHatirlatmaSmsMetni(talep, link),
      });
    } catch (e) {
      console.error("[ihale-hatirlatma] cekici link", c.id, e);
    }
  }
  if (alicilar.length === 0) {
    await hatirlatmaKaydet({
      talepId: talep.id,
      adim,
      hedef: "cekici",
      topluSmsIsId: null,
      aliciSayisi: 0,
    });
    return { ok: false, alici: 0 };
  }

  const is = await olusturTopluSmsIsi({
    gonderenEposta: "cron:ihale-hatirlatma",
    mesaj: "acilcozumbul.com: Acik yol yardim talebi hatirlatma",
    tempo: { partiBoyutu: 1, beklemeSn: 8, jitterOran: 0.15 },
    alicilar,
  });
  const kayit = await hatirlatmaKaydet({
    talepId: talep.id,
    adim,
    hedef: "cekici",
    topluSmsIsId: is.id,
    aliciSayisi: alicilar.length,
  });
  if (!kayit) return { ok: false, alici: 0 };
  return { ok: true, isId: is.id, alici: alicilar.length };
}

/**
 * Açık, acil olmayan ihaleler için vadesi gelen hatırlatmaları toplu SMS kuyruğuna alır.
 */
export async function isleIhaleHatirlatmalari(
  baseUrl: string,
  now: Date = new Date()
): Promise<IhaleHatirlatmaCronOzet> {
  const ozet: IhaleHatirlatmaCronOzet = {
    talepIncelenen: 0,
    musteriGonderilen: 0,
    cekiciGonderilen: 0,
    atlanan: 0,
    hatalar: [],
  };

  if (!supabaseDbAktif()) {
    ozet.hatalar.push("Veritabanı yok.");
    return ozet;
  }

  const talepler = await getTaleplerAcikIhale();
  const cekiciler = await getCekiciler();

  for (const talep of talepler) {
    if (await isSimulasyonTalep(talep.id)) {
      ozet.atlanan += 1;
      continue;
    }
    if (!ihaleHatirlatmaUygunMu(talep, now)) {
      ozet.atlanan += 1;
      continue;
    }
    ozet.talepIncelenen += 1;

    for (const adim of ADIMLAR) {
      if (adim > IHALE_HATIRLATMA_ADIM_SAYISI) break;
      if (!ihaleHatirlatmaAdimiVadesiGeldiMi(talep, adim, now)) continue;

      try {
        const m = await musteriHatirlatmaGonder(talep, adim, baseUrl);
        if (m.ok) ozet.musteriGonderilen += 1;
      } catch (e) {
        ozet.hatalar.push(
          `musteri ${talep.id} adim${adim}: ${e instanceof Error ? e.message : e}`
        );
      }

      try {
        const c = await cekiciHatirlatmaGonder(
          talep,
          adim,
          cekiciler,
          baseUrl,
          now
        );
        if (c.ok) ozet.cekiciGonderilen += 1;
      } catch (e) {
        ozet.hatalar.push(
          `cekici ${talep.id} adim${adim}: ${e instanceof Error ? e.message : e}`
        );
      }
    }
  }

  if (ozet.musteriGonderilen + ozet.cekiciGonderilen > 0) {
    try {
      await tetikleTopluSmsKuyruk();
    } catch (e) {
      ozet.hatalar.push(
        `kuyruk: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return ozet;
}
