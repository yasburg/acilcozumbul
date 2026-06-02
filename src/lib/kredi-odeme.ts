import { getSupabaseAdmin } from "./supabase/admin";
import {
  krediOdemeFromRow,
  krediOdemeToRow,
  type KrediOdemeRow,
} from "./supabase/mappers";
import type { KrediOdeme } from "./types";

export async function kaydetKrediOdeme(kayit: KrediOdeme): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("kredi_odemeler")
    .insert(krediOdemeToRow(kayit));
  if (error) throw error;
}

export async function getKrediOdemeById(
  id: string
): Promise<KrediOdeme | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("kredi_odemeler")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? krediOdemeFromRow(data as KrediOdemeRow) : undefined;
}

export async function listeleKrediOdemeler(): Promise<KrediOdeme[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("kredi_odemeler")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  return (data as KrediOdemeRow[]).map(krediOdemeFromRow);
}
