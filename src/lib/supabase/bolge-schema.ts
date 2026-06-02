import { getSupabaseAdmin, supabaseDbAktif } from "./admin";

let onbellek: boolean | null = null;

/** Migration 007 — hizmet_bolgeleri, hizmet_modu, konum_*, menzil_km */
export async function hizmetBolgeSutunlariVar(): Promise<boolean> {
  if (onbellek !== null) return onbellek;
  if (!supabaseDbAktif()) {
    onbellek = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("hizmet_modu, hizmet_bolgeleri, menzil_km, konum_lat")
    .limit(1);
  onbellek = !error;
  return onbellek;
}

export const MIGRATION_007_MESAJ =
  "Bölge ayarları için Supabase’de supabase/migrations/007_cekici_hizmet_bolge.sql dosyasını SQL Editor’da çalıştırın.";
