import { getCekiciler, updateCekici } from "./db";
import { cekiciBildirimKrediTutari } from "./ihale";
import { cekiciToplamKredi } from "./kredi-bakiye";
import {
  guncelleSmsSablon,
  listeTumSmsSablonlari,
  olusturSmsSablon,
  panelSmsSablonTablosuVar,
  type PanelSmsSablon,
} from "./sms-sablon-db";
import { getSupabaseAdmin } from "./supabase/admin";
import type { Cekici } from "./types";

export const KREDI_TANIM_SABLON_ETIKET = "Kredi tanımı";
export const KREDI_TANIM_PH = "{kredi}";
export const KREDI_TANIM_SABLON_GOVDE =
  `Hesabiniza ${KREDI_TANIM_PH} kredi tanimlanmistir. Iyi gunler, iyi calismalar.`;

export type KrediDagitimUcDurum = "hepsi" | "evet" | "hayir";

export type KrediDagitimFiltre = {
  sehirler?: string[];
  abone?: KrediDagitimUcDurum;
  rozet?: KrediDagitimUcDurum;
  profilFoto?: KrediDagitimUcDurum;
  /** Teklif sayısı alt sınır (dahil) */
  teklifMin?: number | null;
  teklifMax?: number | null;
  /** Tahmini harcanan kredi alt sınır */
  harcananMin?: number | null;
  harcananMax?: number | null;
};

export type KrediDagitimSatir = {
  id: string;
  ad: string;
  telefon: string;
  sehir: string;
  kredi: number;
  abonelikKredi: number;
  toplamKredi: number;
  abone: boolean;
  rozetAktif: boolean;
  profilFotoVar: boolean;
  teklifSayisi: number;
  harcananKredi: number;
};

export function krediTanimSmsMesaji(
  kredi: number,
  sablonGovde = KREDI_TANIM_SABLON_GOVDE
): string {
  const miktar = Math.max(0, Math.floor(Number(kredi) || 0));
  return sablonGovde.split(KREDI_TANIM_PH).join(String(miktar)).trim();
}

export function profilFotoVarMi(
  c: Pick<Cekici, "profilFotoDurum" | "profilFotoUrl">
): boolean {
  const durum = c.profilFotoDurum ?? "yok";
  return durum !== "yok";
}

function sayiSinir(n: number | null | undefined): number | null {
  if (n == null) return null;
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.floor(v);
}

export function krediDagitimFiltreUygula(
  satirlar: KrediDagitimSatir[],
  filtre: KrediDagitimFiltre
): KrediDagitimSatir[] {
  const sehirler = (filtre.sehirler ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  const sehirSet = sehirler.length ? new Set(sehirler) : null;
  const teklifMin = sayiSinir(filtre.teklifMin);
  const teklifMax = sayiSinir(filtre.teklifMax);
  const harcananMin = sayiSinir(filtre.harcananMin);
  const harcananMax = sayiSinir(filtre.harcananMax);
  const abone = filtre.abone ?? "hepsi";
  const rozet = filtre.rozet ?? "hepsi";
  const profilFoto = filtre.profilFoto ?? "hepsi";

  return satirlar.filter((s) => {
    if (sehirSet && !sehirSet.has(s.sehir)) return false;
    if (abone === "evet" && !s.abone) return false;
    if (abone === "hayir" && s.abone) return false;
    if (rozet === "evet" && !s.rozetAktif) return false;
    if (rozet === "hayir" && s.rozetAktif) return false;
    if (profilFoto === "evet" && !s.profilFotoVar) return false;
    if (profilFoto === "hayir" && s.profilFotoVar) return false;
    if (teklifMin != null && s.teklifSayisi < teklifMin) return false;
    if (teklifMax != null && s.teklifSayisi > teklifMax) return false;
    if (harcananMin != null && s.harcananKredi < harcananMin) return false;
    if (harcananMax != null && s.harcananKredi > harcananMax) return false;
    return true;
  });
}

async function sayimHaritasi(tablo: "teklifler" | "sms_log"): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const sb = getSupabaseAdmin();
  const page = 1000;
  let from = 0;
  for (;;) {
    let q = sb.from(tablo).select("cekici_id").range(from, from + page - 1);
    if (tablo === "sms_log") {
      q = q.eq("gonderildi", true).eq("alici_tipi", "cekici");
    }
    const { data, error } = await q;
    if (error) throw error;
    const rows = data ?? [];
    for (const r of rows) {
      const id = String((r as { cekici_id?: string }).cekici_id ?? "");
      if (!id || id === "musteri") continue;
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    if (rows.length < page) break;
    from += page;
  }
  return map;
}

async function aktifAboneCekiciIds(): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .select("cekici_id")
    .in("status", ["active", "past_due"]);
  if (error) throw error;
  return new Set(
    (data ?? []).map((r: any) => String(r.cekici_id))
  );
}

export async function ensureKrediTanimSmsSablon(
  govde?: string
): Promise<PanelSmsSablon | null> {
  if (!(await panelSmsSablonTablosuVar())) return null;
  const liste = await listeTumSmsSablonlari();
  const mevcut = liste.find(
    (s) =>
      s.etiket.trim().toLocaleLowerCase("tr-TR") ===
      KREDI_TANIM_SABLON_ETIKET.toLocaleLowerCase("tr-TR")
  );
  const hedefGovde = (govde ?? "").trim() || KREDI_TANIM_SABLON_GOVDE;
  if (mevcut) {
    if (govde != null && govde.trim() && mevcut.govde !== hedefGovde) {
      return guncelleSmsSablon(mevcut.id, { govde: hedefGovde, aktif: true });
    }
    return mevcut;
  }
  return olusturSmsSablon({
    etiket: KREDI_TANIM_SABLON_ETIKET,
    govde: hedefGovde,
    sira: 50,
    aktif: true,
  });
}

export async function listeleKrediDagitimAdaylari(
  filtre: KrediDagitimFiltre = {}
): Promise<{
  satirlar: KrediDagitimSatir[];
  sehirler: string[];
  sablon: PanelSmsSablon | null;
}> {
  const [cekiciler, aboneIds, teklifMap, smsMap, sablon] = await Promise.all([
    getCekiciler(),
    aktifAboneCekiciIds(),
    sayimHaritasi("teklifler"),
    sayimHaritasi("sms_log"),
    ensureKrediTanimSmsSablon(),
  ]);

  const ham: KrediDagitimSatir[] = cekiciler
    .filter((c) => !c.testerHesap)
    .map((c) => {
      const smsAdet = smsMap.get(c.id) ?? 0;
      const birim = cekiciBildirimKrediTutari(c);
      return {
        id: c.id,
        ad: c.ad,
        telefon: c.telefon,
        sehir: c.sehir || "—",
        kredi: Number(c.kredi) || 0,
        abonelikKredi: Number(c.abonelikKredi) || 0,
        toplamKredi: cekiciToplamKredi(c),
        abone: aboneIds.has(c.id),
        rozetAktif: Boolean(c.rozetAktif),
        profilFotoVar: profilFotoVarMi(c),
        teklifSayisi: teklifMap.get(c.id) ?? 0,
        harcananKredi: smsAdet * birim,
      };
    });

  const sehirler = [
    ...new Set(ham.map((s) => s.sehir).filter((s) => s && s !== "—")),
  ].sort((a, b) => a.localeCompare(b, "tr"));

  const satirlar = krediDagitimFiltreUygula(ham, filtre).sort((a, b) =>
    a.ad.localeCompare(b.ad, "tr")
  );

  return { satirlar, sehirler, sablon };
}

export async function topluKrediDagit(opts: {
  cekiciIds: string[];
  miktar: number;
}): Promise<{
  dagitilan: number;
  alicilar: Array<{ id: string; ad: string; telefon: string; yeniKredi: number }>;
}> {
  const miktar = Math.floor(Number(opts.miktar));
  if (!Number.isFinite(miktar) || miktar < 1 || miktar > 50_000) {
    throw new Error("Kredi miktarı 1–50000 arası olmalı.");
  }
  const ids = [...new Set(opts.cekiciIds.map(String).filter(Boolean))];
  if (ids.length === 0) throw new Error("En az bir kullanıcı seçin.");
  if (ids.length > 2000) throw new Error("En fazla 2000 kullanıcıya dağıtılabilir.");

  const cekiciler = await getCekiciler();
  const byId = new Map(cekiciler.map((c) => [c.id, c]));
  const alicilar: Array<{
    id: string;
    ad: string;
    telefon: string;
    yeniKredi: number;
  }> = [];

  for (const id of ids) {
    const c = byId.get(id);
    if (!c || c.testerHesap) continue;
    c.kredi = Number(c.kredi || 0) + miktar;
    await updateCekici(c);
    alicilar.push({
      id: c.id,
      ad: c.ad,
      telefon: c.telefon,
      yeniKredi: c.kredi,
    });
  }

  if (alicilar.length === 0) {
    throw new Error("Dağıtılacak geçerli kullanıcı bulunamadı.");
  }

  return { dagitilan: alicilar.length, alicilar };
}
