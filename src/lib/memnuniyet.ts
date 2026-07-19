import { randomUUID } from "crypto";
import { getTaleplerMemnuniyetBekleyen } from "./db";
import { notifyMusteriMemnuniyet } from "./sms";
import { getSupabaseAdmin } from "./supabase/admin";
import type { MusteriDegerlendirme, Talep } from "./types";

/** Anlaşmadan sonra müşteri değerlendirmesi için bekleme */
export function memnuniyetBekleMs(): number {
  const dk = parseInt(process.env.MEMNUNIYET_BEKLE_DK ?? "1", 10);
  return (Number.isFinite(dk) && dk > 0 ? dk : 1) * 60 * 1000;
}

export function memnuniyetOrtalamaPuan(
  genel: number,
  fiyat: number,
  sure: number
): number {
  return Math.round(((genel + fiyat + sure) / 3) * 10) / 10;
}

type DegerlendirmeRow = {
  id: string;
  talep_id: string;
  cekici_id: string;
  puan: number;
  puan_genel: number | null;
  puan_fiyat: number | null;
  puan_sure: number | null;
  yorum: string | null;
  olusturulma: string;
};

function rowToDegerlendirme(r: DegerlendirmeRow): MusteriDegerlendirme {
  const genel = r.puan_genel ?? r.puan;
  const fiyat = r.puan_fiyat ?? r.puan;
  const sure = r.puan_sure ?? r.puan;
  return {
    id: r.id,
    talepId: r.talep_id,
    cekiciId: r.cekici_id,
    puan: r.puan,
    puanGenel: genel,
    puanFiyat: fiyat,
    puanSure: sure,
    yorum: r.yorum ?? undefined,
    olusturulma: r.olusturulma,
  };
}

export async function memnuniyetSmsIsaretle(talepId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("talepler")
    .update({ memnuniyet_sms_gonderildi: true })
    .eq("id", talepId);
  if (error) throw error;
}

/** Form açıksa ve SMS gitmediyse hatırlatma gönder */
export async function memnuniyetSmsGonderGerekirse(
  talep: Talep,
  baseUrl: string
): Promise<boolean> {
  if (talep.memnuniyetSmsGonderildi) return false;

  const mevcut = await getDegerlendirmeByTalepId(talep.id);
  const durum = memnuniyetDurumuHesapla(talep, mevcut);
  if (!durum.formAcik) return false;

  await notifyMusteriMemnuniyet(talep, baseUrl);
  await memnuniyetSmsIsaretle(talep.id);
  return true;
}

/** Zamanı gelmiş tüm talepler için toplu SMS (cron / manuel) */
export async function topluMemnuniyetSmsGonder(baseUrl: string): Promise<number> {
  const talepler = await getTaleplerMemnuniyetBekleyen();
  let adet = 0;

  for (const talep of talepler) {
    if (talep.durum !== "anlaşıldı" || talep.memnuniyetSmsGonderildi) continue;
    const mevcut = await getDegerlendirmeByTalepId(talep.id);
    if (mevcut) continue;
    const durum = memnuniyetDurumuHesapla(talep, null);
    if (!durum.formAcik) continue;

    await notifyMusteriMemnuniyet(talep, baseUrl);
    await memnuniyetSmsIsaretle(talep.id);
    adet += 1;
  }

  return adet;
}

export async function getDegerlendirmeByTalepId(
  talepId: string
): Promise<MusteriDegerlendirme | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("musteri_degerlendirmeler")
    .select("*")
    .eq("talep_id", talepId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToDegerlendirme(data as DegerlendirmeRow) : undefined;
}

export async function getDegerlendirmelerByCekiciId(
  cekiciId: string
): Promise<MusteriDegerlendirme[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("musteri_degerlendirmeler")
    .select("*")
    .eq("cekici_id", cekiciId)
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  return (data as DegerlendirmeRow[]).map(rowToDegerlendirme);
}

export async function getTumDegerlendirmeler(): Promise<
  (MusteriDegerlendirme & { cekiciAd?: string; musteriAd?: string })[]
> {
  const { data, error } = await getSupabaseAdmin()
    .from("musteri_degerlendirmeler")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as DegerlendirmeRow[];
  if (rows.length === 0) return [];

  const talepIds = rows.map((r) => r.talep_id);
  const { data: talepler, error: tErr } = await getSupabaseAdmin()
    .from("talepler")
    .select("id, ad, soyad")
    .in("id", talepIds);
  if (tErr) throw tErr;

  const cekiciIds = [...new Set(rows.map((r) => r.cekici_id))];
  const { data: cekiciler, error: cErr } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("id, ad")
    .in("id", cekiciIds);
  if (cErr) throw cErr;

  const talepMap = new Map(
    (talepler ?? []).map((t: { id: string; ad: string; soyad: string }) => [
      t.id,
      t,
    ])
  );
  const cekiciMap = new Map(
    (cekiciler ?? []).map((c: { id: string; ad: string }) => [c.id, c.ad])
  );

  return rows.map((r) => {
    const t = talepMap.get(r.talep_id);
    return {
      ...rowToDegerlendirme(r),
      musteriAd: t ? `${t.ad} ${t.soyad}` : undefined,
      cekiciAd: cekiciMap.get(r.cekici_id),
    };
  });
}

export interface CekiciHizmetPuani {
  ortalama: number | null;
  adet: number;
}

export async function cekiciHizmetPuani(
  cekiciId: string
): Promise<CekiciHizmetPuani> {
  const liste = await getDegerlendirmelerByCekiciId(cekiciId);
  if (liste.length === 0) return { ortalama: null, adet: 0 };
  const ort = liste.reduce((s, d) => s + d.puan, 0) / liste.length;
  return {
    ortalama: Math.round(ort * 10) / 10,
    adet: liste.length,
  };
}

export function gorunurTercihPuani(
  tercihPuani: number | null,
  hizmetOrt: number | null
): number | null {
  if (hizmetOrt == null) return tercihPuani;
  if (tercihPuani == null) return hizmetOrt;
  return Math.round((tercihPuani * 0.55 + hizmetOrt * 0.45) * 10) / 10;
}

export interface MemnuniyetDurumu {
  degerlendirildi: boolean;
  puan?: number;
  puanGenel?: number;
  puanFiyat?: number;
  puanSure?: number;
  yorum?: string;
  formAcik: boolean;
  beklemede: boolean;
  kalanMs: number;
  anlasildiAt: string | null;
}

export function memnuniyetDurumuHesapla(
  talep: Talep,
  mevcut?: MusteriDegerlendirme | null
): MemnuniyetDurumu {
  const anlasildiAt = talep.anlasildiAt ?? null;

  if (mevcut) {
    return {
      degerlendirildi: true,
      puan: mevcut.puan,
      puanGenel: mevcut.puanGenel,
      puanFiyat: mevcut.puanFiyat,
      puanSure: mevcut.puanSure,
      yorum: mevcut.yorum,
      formAcik: false,
      beklemede: false,
      kalanMs: 0,
      anlasildiAt,
    };
  }

  if (talep.durum !== "anlaşıldı" || !anlasildiAt) {
    return {
      degerlendirildi: false,
      formAcik: false,
      beklemede: false,
      kalanMs: 0,
      anlasildiAt,
    };
  }

  const bas = new Date(anlasildiAt).getTime();
  const simdi = Date.now();
  const acilis = bas + memnuniyetBekleMs();
  const kalanMs = Math.max(0, acilis - simdi);

  if (simdi < acilis) {
    return {
      degerlendirildi: false,
      formAcik: false,
      beklemede: true,
      kalanMs,
      anlasildiAt,
    };
  }

  return {
    degerlendirildi: false,
    formAcik: true,
    beklemede: false,
    kalanMs: 0,
    anlasildiAt,
  };
}

export interface MemnuniyetPuanlari {
  puanGenel: number;
  puanFiyat: number;
  puanSure: number;
  yorum?: string;
}

export async function kaydetMusteriDegerlendirme(
  talep: Talep,
  puanlar: MemnuniyetPuanlari
): Promise<MusteriDegerlendirme> {
  if (talep.durum !== "anlaşıldı" || !talep.kazananCekiciId) {
    throw new Error("Bu talep için değerlendirme yapılamaz.");
  }

  const { puanGenel, puanFiyat, puanSure, yorum } = puanlar;
  for (const [ad, v] of [
    ["Genel", puanGenel],
    ["Fiyat", puanFiyat],
    ["Süre", puanSure],
  ] as const) {
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      throw new Error(`${ad} puanı 1–5 arasında olmalı.`);
    }
  }

  const mevcut = await getDegerlendirmeByTalepId(talep.id);
  if (mevcut) throw new Error("Bu talep zaten değerlendirilmiş.");

  const durum = memnuniyetDurumuHesapla(talep, null);
  if (!durum.formAcik) {
    if (durum.beklemede) {
      throw new Error(
        "Değerlendirme formu henüz açılmadı. Lütfen biraz sonra tekrar deneyin."
      );
    }
    throw new Error("Değerlendirme süresi geçerli değil.");
  }

  const ort = memnuniyetOrtalamaPuan(puanGenel, puanFiyat, puanSure);

  const kayit: DegerlendirmeRow = {
    id: randomUUID(),
    talep_id: talep.id,
    cekici_id: talep.kazananCekiciId,
    puan: ort,
    puan_genel: puanGenel,
    puan_fiyat: puanFiyat,
    puan_sure: puanSure,
    yorum: yorum?.trim() || null,
    olusturulma: new Date().toISOString(),
  };

  const { error } = await getSupabaseAdmin()
    .from("musteri_degerlendirmeler")
    .insert(kayit);
  if (error) throw error;

  return rowToDegerlendirme(kayit);
}
