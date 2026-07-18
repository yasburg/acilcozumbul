import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase/admin";
import { getCekiciById } from "./db";
import type { Cekici, Talep, Teklif } from "./types";
import {
  demoBaslangicDurumu,
  demoRakipAd,
  demoRakipCekiciId,
  isDemoTalepId,
  type DemoOturumDurum,
  type DemoSmsKaydi,
  DEMO_TALEP_PREFIX,
} from "./demo-fixtures";
import {
  cekiciAcikTalepUygunMu,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerdiMi,
  cekiciTeklifVerebilirMi,
  ihaleAcikMi,
} from "./ihale";
import { teklifFiyatDegistiMi } from "./cekici-puan";
import { talepBolge, talepSorunOzet } from "./talep-utils";
import type { ListeDurumu, TalepOzet } from "./types";

export const DEMO_COOKIE = "acil_demo";

export function demoModuAcikMi(): boolean {
  return process.env.DEMO_MODE_ENABLED !== "false";
}

type DemoOturumRow = {
  id: string;
  cekici_id: string;
  bitis: string;
  durum: DemoOturumDurum;
  olusturan: string | null;
};

export type DemoSimuleOlay =
  | "yeni_ihale_gizli"
  | "ihaleyi_ac"
  | "rakip_teklif"
  | "benim_teklifim"
  | "musteri_secti"
  | "musteri_yeni_teklif_sms";

export type AktifDemoOturum = {
  id: string;
  cekiciId: string;
  bitis: string;
  kalanSn: number;
  durum: DemoOturumDurum;
  olusturan: string | null;
};

function normalizeDurum(raw: unknown): DemoOturumDurum {
  if (!raw || typeof raw !== "object") {
    return { talepler: [], sms: [], anaTalepId: "" };
  }
  const d = raw as DemoOturumDurum;
  return {
    talepler: Array.isArray(d.talepler) ? d.talepler : [],
    sms: Array.isArray(d.sms) ? d.sms : [],
    anaTalepId: typeof d.anaTalepId === "string" ? d.anaTalepId : "",
  };
}

async function oturumGet(id: string): Promise<DemoOturumRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("demo_oturum")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (error.message.includes("demo_oturum")) return null;
    throw error;
  }
  if (!data) return null;
  const row = data as DemoOturumRow;
  return {
    ...row,
    durum: normalizeDurum(row.durum),
  };
}

/** Bu çekiciye ait süresi dolmamış en güncel demo oturumu */
async function oturumGetByCekiciId(
  cekiciId: string
): Promise<DemoOturumRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("demo_oturum")
    .select("*")
    .eq("cekici_id", cekiciId)
    .gt("bitis", new Date().toISOString())
    .order("bitis", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (error.message.includes("demo_oturum")) return null;
    throw error;
  }
  if (!data) return null;
  const row = data as DemoOturumRow;
  return {
    ...row,
    durum: normalizeDurum(row.durum),
  };
}

async function oturumSil(id: string): Promise<void> {
  await getSupabaseAdmin().from("demo_oturum").delete().eq("id", id);
}

async function cekiciDemoOturumlariniTemizle(cekiciId: string): Promise<void> {
  try {
    await getSupabaseAdmin().from("demo_oturum").delete().eq("cekici_id", cekiciId);
  } catch {
    /* tablo yoksa yoksay */
  }
}

async function oturumKaydet(row: DemoOturumRow): Promise<void> {
  const { error } = await getSupabaseAdmin().from("demo_oturum").upsert({
    id: row.id,
    cekici_id: row.cekici_id,
    bitis: row.bitis,
    durum: row.durum,
    olusturan: row.olusturan,
  });
  if (error) throw error;
}

function kalanSn(bitis: string): number {
  return Math.max(0, Math.floor((new Date(bitis).getTime() - Date.now()) / 1000));
}

function oturumGecerliMi(row: DemoOturumRow | null): row is DemoOturumRow {
  if (!row) return false;
  return kalanSn(row.bitis) > 0;
}

export async function demoCookieOturumId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(DEMO_COOKIE)?.value ?? null;
}

/** Süresi dolmuş satırı / çerezi temizlemek için (Route Handler içinde) */
export async function demoCookieTemizle(): Promise<void> {
  try {
    const jar = await cookies();
    jar.delete(DEMO_COOKIE);
  } catch {
    /* read-only cookie store (ör. bazı RSC bağlamları) */
  }
}

async function suresiDolanOturumlariTemizle(): Promise<void> {
  try {
    await getSupabaseAdmin()
      .from("demo_oturum")
      .delete()
      .lt("bitis", new Date().toISOString());
  } catch {
    /* tablo yoksa yoksay */
  }
}

export async function getAktifDemoOturum(
  oturumId?: string | null
): Promise<AktifDemoOturum | null> {
  if (!demoModuAcikMi()) return null;
  const id = oturumId ?? (await demoCookieOturumId());
  if (!id) return null;

  const row = await oturumGet(id);
  if (!oturumGecerliMi(row)) {
    if (row) await oturumSil(id);
    await demoCookieTemizle();
    return null;
  }

  return {
    id: row.id,
    cekiciId: row.cekici_id,
    bitis: row.bitis,
    kalanSn: kalanSn(row.bitis),
    durum: row.durum,
    olusturan: row.olusturan,
  };
}

export async function getAktifDemoOturumRequest(
  request: NextRequest
): Promise<AktifDemoOturum | null> {
  const cookieId = request.cookies.get(DEMO_COOKIE)?.value ?? null;
  return getAktifDemoOturum(cookieId);
}

/**
 * Demo overlay: çerez eşleşmesi VEYA bu çekiciye atanmış aktif oturum.
 * (Telefon: admin laptop’ta başlatır → çekici telefonda giriş yapar, çerez yok.)
 */
export async function demoOturumCekiciIcin(
  cekiciId: string,
  request?: NextRequest
): Promise<AktifDemoOturum | null> {
  if (!demoModuAcikMi()) return null;

  const fromCookie = request
    ? await getAktifDemoOturumRequest(request)
    : await getAktifDemoOturum();
  if (fromCookie?.cekiciId === cekiciId) return fromCookie;

  const row = await oturumGetByCekiciId(cekiciId);
  if (!row) return null;
  const sn = kalanSn(row.bitis);
  if (sn <= 0) {
    await oturumSil(row.id);
    return null;
  }

  return {
    id: row.id,
    cekiciId: row.cekici_id,
    bitis: row.bitis,
    kalanSn: sn,
    durum: row.durum,
    olusturan: row.olusturan,
  };
}

/** API yanıtına demo çerezini yaz (telefonda sonraki istekler için) */
export function demoCookieYanitaYaz(
  res: NextResponse,
  oturum: AktifDemoOturum
): void {
  res.cookies.set(DEMO_COOKIE, oturum.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.max(60, oturum.kalanSn),
    path: "/",
  });
}

export async function baslatDemoOturum(opts: {
  cekiciId: string;
  sureDk?: number;
  olusturan?: string;
}): Promise<AktifDemoOturum> {
  if (!demoModuAcikMi()) {
    throw new Error("Demo modu kapalı.");
  }

  const cekici = await getCekiciById(opts.cekiciId);
  if (!cekici) throw new Error("Çekici bulunamadı.");

  await suresiDolanOturumlariTemizle();
  await cekiciDemoOturumlariniTemizle(cekici.id);

  const sureDk = Math.min(30, Math.max(1, opts.sureDk ?? 5));
  const id = randomUUID();
  const bitis = new Date(Date.now() + sureDk * 60 * 1000).toISOString();
  const durum = demoBaslangicDurumu(cekici);

  await oturumKaydet({
    id,
    cekici_id: cekici.id,
    bitis,
    durum,
    olusturan: opts.olusturan ?? null,
  });

  return {
    id,
    cekiciId: cekici.id,
    bitis,
    kalanSn: kalanSn(bitis),
    durum,
    olusturan: opts.olusturan ?? null,
  };
}

export async function durdurDemoOturum(oturumId: string): Promise<void> {
  await oturumSil(oturumId);
}

export function demoTalepBul(
  oturum: AktifDemoOturum,
  talepId: string
): Talep | undefined {
  return oturum.durum.talepler.find((t) => t.id === talepId);
}

export async function demoTalepGetir(
  talepId: string,
  request?: NextRequest,
  cekiciId?: string
): Promise<{ oturum: AktifDemoOturum; talep: Talep } | null> {
  if (!isDemoTalepId(talepId) || !demoModuAcikMi()) return null;

  let oturum: AktifDemoOturum | null = null;

  if (cekiciId) {
    oturum = await demoOturumCekiciIcin(cekiciId, request);
  } else {
    // Müşteri tarafı: plan gereği aynı tarayıcıdaki acil_demo çerezi şart
    oturum = request
      ? await getAktifDemoOturumRequest(request)
      : await getAktifDemoOturum();
  }

  if (!oturum) return null;
  if (cekiciId && oturum.cekiciId !== cekiciId) return null;

  const talep = demoTalepBul(oturum, talepId);
  if (!talep) return null;
  return { oturum, talep };
}

async function oturumGuncelle(
  oturum: AktifDemoOturum,
  patch: (durum: DemoOturumDurum) => DemoOturumDurum
): Promise<AktifDemoOturum> {
  const row = await oturumGet(oturum.id);
  if (!row || !oturumGecerliMi(row)) {
    throw new Error("Demo oturumu sona erdi.");
  }
  const yeniDurum = patch(normalizeDurum(row.durum));
  await oturumKaydet({ ...row, durum: yeniDurum });
  return {
    ...oturum,
    durum: yeniDurum,
    kalanSn: kalanSn(row.bitis),
  };
}

function smsEkle(
  durum: DemoOturumDurum,
  kayit: Omit<DemoSmsKaydi, "id" | "gonderim">
): DemoOturumDurum {
  return {
    ...durum,
    sms: [
      {
        id: randomUUID(),
        gonderim: new Date().toISOString(),
        ...kayit,
      },
      ...durum.sms,
    ].slice(0, 30),
  };
}

function talepGuncelle(
  durum: DemoOturumDurum,
  talepId: string,
  patch: (t: Talep) => Talep
): DemoOturumDurum {
  return {
    ...durum,
    talepler: durum.talepler.map((t) => (t.id === talepId ? patch(t) : t)),
  };
}

export async function demoSimuleOlay(
  oturumId: string,
  olay: DemoSimuleOlay
): Promise<AktifDemoOturum> {
  const oturum = await getAktifDemoOturum(oturumId);
  if (!oturum) throw new Error("Aktif demo oturumu yok.");

  const cekici = await getCekiciById(oturum.cekiciId);
  if (!cekici) throw new Error("Çekici bulunamadı.");

  const anaId = oturum.durum.anaTalepId;
  const ana = demoTalepBul(oturum, anaId);
  if (!ana && olay !== "yeni_ihale_gizli") {
    throw new Error("Demo talep bulunamadı.");
  }

  switch (olay) {
    case "yeni_ihale_gizli": {
      const yeni = demoBaslangicDurumu(cekici);
      const gizli = yeni.talepler.find((t) => !t.bildirilenCekiciIds.length);
      if (!gizli) throw new Error("Gizli talep oluşturulamadı.");
      return oturumGuncelle(oturum, (d) => {
        let next: DemoOturumDurum = {
          ...d,
          talepler: [gizli, ...d.talepler],
        };
        next = smsEkle(next, {
          aliciTipi: "cekici",
          telefon: cekici.telefon,
          mesaj: `${gizli.ad} ${gizli.soyad.charAt(0)}. yolda kaldı — gizli demo ihale`,
          link: `/cekici/talep/${gizli.id}`,
        });
        return next;
      });
    }
    case "ihaleyi_ac": {
      const gizli = oturum.durum.talepler.find(
        (t) =>
          ihaleAcikMi(t) &&
          !cekiciTalebeBildirildiMi(t, cekici.id) &&
          cekiciAcikTalepUygunMu(t, cekici)
      );
      const hedef = gizli ?? ana!;
      return oturumGuncelle(oturum, (d) => {
        let next = talepGuncelle(d, hedef.id, (t) => ({
          ...t,
          bildirilenCekiciIds: [...new Set([...(t.bildirilenCekiciIds ?? []), cekici.id])],
        }));
        next = smsEkle(next, {
          aliciTipi: "cekici",
          telefon: cekici.telefon,
          mesaj: `${hedef.ad} ${hedef.soyad.charAt(0)}. yolda kaldı — demo ihale`,
          link: `/cekici/talep/${hedef.id}`,
        });
        return next;
      });
    }
    case "rakip_teklif": {
      const teklif: Teklif = {
        id: randomUUID(),
        cekiciId: demoRakipCekiciId(),
        cekiciAd: demoRakipAd(),
        fiyat: 2800,
        ilkFiyat: 2800,
        fiyatDegisti: false,
        tahminiSureDk: 25,
        mesaj: "25 dakikada oradayım.",
        tarih: new Date().toISOString(),
        durum: "aktif",
      };
      return oturumGuncelle(oturum, (d) => {
        let next = talepGuncelle(d, anaId, (t) => ({
          ...t,
          teklifler: [...(t.teklifler ?? []), teklif],
        }));
        next = smsEkle(next, {
          aliciTipi: "musteri",
          telefon: ana!.telefon,
          mesaj: `Yeni teklif: ${teklif.fiyat} TL (${teklif.cekiciAd}) — demo`,
        });
        return next;
      });
    }
    case "benim_teklifim": {
      if (cekiciTeklifVerdiMi(ana!, cekici.id)) {
        throw new Error("Zaten teklif verdiniz.");
      }
      const teklif: Teklif = {
        id: randomUUID(),
        cekiciId: cekici.id,
        cekiciAd: cekici.ad,
        fiyat: 2450,
        ilkFiyat: 2450,
        fiyatDegisti: false,
        tahminiSureDk: 20,
        mesaj: "20 dakikada yanınızdayım.",
        tarih: new Date().toISOString(),
        durum: "aktif",
      };
      return oturumGuncelle(oturum, (d) =>
        talepGuncelle(d, anaId, (t) => ({
          ...t,
          bildirilenCekiciIds: [...new Set([...(t.bildirilenCekiciIds ?? []), cekici.id])],
          teklifler: [...(t.teklifler ?? []), teklif],
        }))
      );
    }
    case "musteri_secti": {
      const benimTeklif = ana!.teklifler?.find(
        (t) => t.cekiciId === cekici.id && t.durum === "aktif"
      );
      const kazanan = benimTeklif ?? ana!.teklifler?.find((t) => t.durum === "aktif");
      if (!kazanan) throw new Error("Seçilecek aktif teklif yok. Önce teklif simüle edin.");
      return oturumGuncelle(oturum, (d) =>
        talepGuncelle(d, anaId, (t) => demoTeklifSecDurumu(t, kazanan.id))
      );
    }
    case "musteri_yeni_teklif_sms": {
      return oturumGuncelle(oturum, (d) =>
        smsEkle(d, {
          aliciTipi: "musteri",
          telefon: ana!.telefon,
          mesaj: "acilcozumbul.com: Tekliflerinizi buradan görebilirsiniz — demo",
          link: `/bekle/${anaId}?demo=${oturum.id}`,
        })
      );
    }
    default:
      throw new Error("Bilinmeyen olay.");
  }
}

export async function demoKatil(
  oturum: AktifDemoOturum,
  talepId: string,
  cekiciId: string
): Promise<Talep> {
  return oturumGuncelle(oturum, (d) =>
    talepGuncelle(d, talepId, (t) => ({
      ...t,
      bildirilenCekiciIds: [...new Set([...(t.bildirilenCekiciIds ?? []), cekiciId])],
    }))
  ).then((o) => {
    const t = demoTalepBul(o, talepId);
    if (!t) throw new Error("Talep bulunamadı.");
    return t;
  });
}

export async function demoTeklifEkle(
  oturum: AktifDemoOturum,
  talepId: string,
  cekici: Cekici,
  body: { fiyat: number; tahminiSureDk: number; mesaj?: string }
): Promise<{ oturum: AktifDemoOturum; teklif: Teklif }> {
  const talep = demoTalepBul(oturum, talepId);
  if (!talep) throw new Error("Talep bulunamadı.");
  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    throw new Error("Bu talebe teklif verilemez.");
  }
  if (!cekiciTalebeBildirildiMi(talep, cekici.id)) {
    throw new Error("Önce ihaleye katılın.");
  }

  const teklif: Teklif = {
    id: randomUUID(),
    cekiciId: cekici.id,
    cekiciAd: cekici.ad,
    fiyat: body.fiyat,
    ilkFiyat: body.fiyat,
    fiyatDegisti: false,
    tahminiSureDk: body.tahminiSureDk,
    mesaj: body.mesaj,
    tarih: new Date().toISOString(),
    durum: "aktif",
  };

  const yeni = await oturumGuncelle(oturum, (d) =>
    talepGuncelle(d, talepId, (t) => ({
      ...t,
      teklifler: [...(t.teklifler ?? []), teklif],
    }))
  );

  return { oturum: yeni, teklif };
}

/** Müşteri bekle ekranından teklif seçimi (DB yazmaz) */
export function demoTeklifSecDurumu(talep: Talep, teklifId: string): Talep {
  if (talep.kazananCekiciId) {
    throw new Error("Zaten bir çekici seçildi.");
  }
  const teklif = talep.teklifler?.find(
    (t) => t.id === teklifId && t.durum === "aktif"
  );
  if (!teklif) {
    throw new Error("Geçersiz teklif.");
  }
  if (teklifFiyatDegistiMi(teklif)) {
    throw new Error("Bu çekici teklif fiyatını değiştirdi.");
  }

  return {
    ...talep,
    durum: "kazanan_belli",
    kazananCekiciId: teklif.cekiciId,
    kazananTeklifId: teklif.id,
    anlasmaDurumu: "bekliyor",
    teklifler: (talep.teklifler ?? []).map((te) => {
      if (te.id === teklif.id) return { ...te, durum: "kazandi" as const };
      if (te.durum === "aktif") return { ...te, durum: "kaybetti" as const };
      return te;
    }),
  };
}

export async function demoTeklifSec(
  oturum: AktifDemoOturum,
  talepId: string,
  teklifId: string
): Promise<{ talep: Talep; kazananTeklif: Teklif }> {
  const talep = demoTalepBul(oturum, talepId);
  if (!talep) throw new Error("Talep bulunamadı.");

  let guncel: Talep;
  try {
    guncel = demoTeklifSecDurumu(talep, teklifId);
  } catch (e) {
    throw e instanceof Error ? e : new Error("Teklif seçilemedi.");
  }

  const yeni = await oturumGuncelle(oturum, (d) =>
    talepGuncelle(d, talepId, () => guncel)
  );
  const sonuc = demoTalepBul(yeni, talepId);
  if (!sonuc) throw new Error("Talep bulunamadı.");
  const kazananTeklif = sonuc.teklifler?.find((t) => t.id === teklifId);
  if (!kazananTeklif) throw new Error("Geçersiz teklif.");

  return { talep: sonuc, kazananTeklif };
}

function demoListeDurumuBelirle(talep: Talep, cekici: Cekici): ListeDurumu {
  const cekiciId = cekici.id;
  if (talep.kazananCekiciId === cekiciId) return "kazandim";
  if ((talep.haricTutulanCekiciIds ?? []).includes(cekiciId)) {
    return "tercih_edilmedi";
  }
  if (talep.kazananCekiciId && talep.kazananCekiciId !== cekiciId) {
    return "kaybettim";
  }
  if (cekiciTeklifVerdiMi(talep, cekiciId)) return "teklif_verdim";
  // Demo mock talepler — bölge/sorun/müsaitlik filtresi uygulanmaz
  if (ihaleAcikMi(talep)) {
    if (cekiciTalebeBildirildiMi(talep, cekiciId)) return "acik";
    return "gizli";
  }
  return "kaybettim";
}

function demoToOzet(talep: Talep, cekici: Cekici): TalepOzet {
  const cekiciId = cekici.id;
  const kazandim = talep.kazananCekiciId === cekiciId;
  const durum = demoListeDurumuBelirle(talep, cekici);
  const aktifTeklifler = talep.teklifler?.filter((t) => t.durum === "aktif") ?? [];
  const benimTeklif = talep.teklifler?.find((t) => t.cekiciId === cekiciId);
  const gizli = durum === "gizli";

  return {
    id: talep.id,
    ad: gizli ? "•••" : talep.ad,
    soyad: gizli ? "" : talep.soyad,
    bolge: talepBolge(talep),
    sorunOzet: gizli ? "Detaylar için ihaleye katılın" : talepSorunOzet(talep.sorun),
    durum: talep.durum,
    olusturulma: talep.olusturulma,
    teklifSayisi: gizli ? undefined : aktifTeklifler.length,
    enDusukTeklif: gizli
      ? undefined
      : aktifTeklifler.length
        ? Math.min(...aktifTeklifler.map((t) => t.fiyat))
        : undefined,
    benimTeklifim: !!benimTeklif,
    kazandim,
    telefon: kazandim ? talep.telefon : undefined,
    listeDurumu: durum,
    gizli,
  };
}

/** Panel listelerini demo state ile birleştirmek için özet üretir */
export function demoPanelVerisi(
  oturum: AktifDemoOturum,
  cekici: Cekici
): {
  bekleyen: TalepOzet[];
  bekleyenGizli: TalepOzet[];
  teklifVerdigim: TalepOzet[];
  kazandiklarim: TalepOzet[];
  kaybettiklerim: TalepOzet[];
  tercihEdilmedi: TalepOzet[];
  bugunTumu: TalepOzet[];
} {
  const tumOzet = oturum.durum.talepler.map((t) => demoToOzet(t, cekici));

  return {
    bekleyen: tumOzet.filter((t) => t.listeDurumu === "acik"),
    bekleyenGizli: tumOzet.filter((t) => t.listeDurumu === "gizli"),
    teklifVerdigim: tumOzet.filter((t) => t.listeDurumu === "teklif_verdim"),
    kazandiklarim: tumOzet.filter((t) => t.listeDurumu === "kazandim"),
    kaybettiklerim: tumOzet.filter(
      (t) => t.listeDurumu === "kaybettim" && t.benimTeklifim
    ),
    tercihEdilmedi: tumOzet.filter((t) => t.listeDurumu === "tercih_edilmedi"),
    bugunTumu: [...tumOzet].sort(
      (a, b) =>
        new Date(b.olusturulma).getTime() - new Date(a.olusturulma).getTime()
    ),
  };
}

/** Plan adı — `demoPanelVerisi` ile aynı */
export const mergeCekiciPanelData = demoPanelVerisi;

export { isDemoTalepId };
