import { randomUUID } from "crypto";
import { krediPaketOdenecekTL, krediPaketBul } from "./kredi-fiyat";
import { getSupabaseAdmin } from "./supabase/admin";
import { odemeFromRow, odemeToRow, type OdemeRow } from "./supabase/mappers";
import type { BekleyenOdeme } from "./types";

export async function olusturBekleyenOdeme(
  cekiciId: string,
  paketTl: number
): Promise<BekleyenOdeme> {
  const paket = krediPaketBul(paketTl);
  if (!paket) {
    throw new Error("Geçersiz kredi paketi.");
  }
  const odeme: BekleyenOdeme = {
    id: randomUUID(),
    cekiciId,
    miktar: paket.kredi,
    tutar: krediPaketOdenecekTL(paket),
    olusturulma: new Date().toISOString(),
    durum: "bekliyor",
  };
  const { error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .insert(odemeToRow(odeme));
  if (error) throw error;
  return odeme;
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
