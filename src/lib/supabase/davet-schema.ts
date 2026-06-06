import { getSupabaseAdmin, supabaseDbAktif } from "./admin";

let onbellek: boolean | null = null;

/** Migration 013 — davet_kodu, davet_eden_id, davet_kullanimlari */
export async function davetKoduSutunuVar(): Promise<boolean> {
  if (onbellek !== null) return onbellek;
  if (!supabaseDbAktif()) {
    onbellek = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("davet_kodu, davet_eden_id")
    .limit(1);
  onbellek = !error;
  return onbellek;
}

export const MIGRATION_013_MESAJ =
  "Davet kodu için Supabase’de supabase/migrations/013_davet_kodu.sql dosyasını SQL Editor’da çalıştırın.";
