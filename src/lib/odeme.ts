import { randomUUID } from "crypto";
import {
  krediPaketOdenecekTL,
  krediPaketBul,
  type KrediPaketKaynak,
} from "./kredi-fiyat";
import {
  ROZET_INDIRIMLI_FIYAT_TL,
  ROZET_LISTE_FIYAT_TL,
} from "./rozet";
import { getSupabaseAdmin } from "./supabase/admin";
import { odemeFromRow, odemeToRow, type OdemeRow } from "./supabase/mappers";
import type { BekleyenOdeme, OdemeFatura } from "./types";

export async function olusturBekleyenOdeme(
  cekiciId: string,
  paketTl: number,
  faturaEposta: string,
  kaynak: KrediPaketKaynak = "kredi"
): Promise<BekleyenOdeme> {
  const paket = krediPaketBul(paketTl, kaynak);
  if (!paket) {
    throw new Error("Geçersiz kredi paketi.");
  }
  const odeme: BekleyenOdeme = {
    id: randomUUID(),
    cekiciId,
    miktar: paket.kredi,
    tutar: krediPaketOdenecekTL(paket),
    paketTl: paket.tutarTL,
    listeFiyati: paket.tutarTL,
    odemeTipi: kaynak === "abonelik" ? "abonelik" : "kredi",
    olusturulma: new Date().toISOString(),
    durum: "bekliyor",
    faturaEposta: faturaEposta.toLowerCase(),
  };
  const { error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .insert(odemeToRow(odeme));
  if (error) throw error;
  return odeme;
}

export async function olusturBekleyenRozetOdeme(
  cekiciId: string,
  faturaEposta: string
): Promise<BekleyenOdeme> {
  const odeme: BekleyenOdeme = {
    id: randomUUID(),
    cekiciId,
    miktar: 0,
    tutar: ROZET_INDIRIMLI_FIYAT_TL,
    listeFiyati: ROZET_LISTE_FIYAT_TL,
    odemeTipi: "rozet",
    olusturulma: new Date().toISOString(),
    durum: "bekliyor",
    faturaEposta: faturaEposta.toLowerCase(),
  };
  const { error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .insert(odemeToRow(odeme));
  if (error) throw error;
  return odeme;
}

export async function guncelleBekleyenOdemeFatura(
  id: string,
  cekiciId: string,
  fatura: OdemeFatura
): Promise<BekleyenOdeme | undefined> {
  const mevcut = await getBekleyenOdeme(id);
  if (!mevcut || mevcut.cekiciId !== cekiciId) return undefined;

  const guncel: BekleyenOdeme = {
    ...mevcut,
    ...fatura,
  };
  const { error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .update({
      fatura_eposta: guncel.faturaEposta,
      fatura_adres: guncel.faturaAdres ?? null,
      fatura_tc_kimlik: guncel.faturaTcKimlik ?? null,
      kurumsal: guncel.kurumsal ?? false,
      sirket_unvan: guncel.sirketUnvan ?? null,
      vergi_no: guncel.vergiNo ?? null,
    })
    .eq("id", id)
    .eq("durum", "bekliyor");
  if (error) throw error;
  return guncel;
}

export async function getBekleyenOdeme(
  id: string
): Promise<BekleyenOdeme | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .select("*")
    .eq("id", id)
    .eq("durum", "bekliyor")
    .maybeSingle();
  if (error) throw error;
  return data ? odemeFromRow(data as OdemeRow) : undefined;
}

export async function tamamlaOdeme(id: string): Promise<BekleyenOdeme | undefined> {
  const mevcut = await getBekleyenOdeme(id);
  if (!mevcut) return undefined;
  const guncel: BekleyenOdeme = { ...mevcut, durum: "tamamlandi" };
  const { error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .update({ durum: "tamamlandi" })
    .eq("id", id);
  if (error) throw error;
  return guncel;
}
