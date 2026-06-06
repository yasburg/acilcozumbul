import { getSupabaseAdmin, supabaseDbAktif } from "./admin";

let onbellek: boolean | null = null;

export async function kampanyaKoduSutunuVar(): Promise<boolean> {
  if (onbellek !== null) return onbellek;
  if (!supabaseDbAktif()) {
    onbellek = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("kampanya_kodlari")
    .select("kod")
    .limit(1);
  onbellek = !error;
  return onbellek;
}

export const MIGRATION_014_MESAJ =
  "Kampanya kodları için Supabase’de supabase/migrations/014_kampanya_kodlari.sql dosyasını SQL Editor’da çalıştırın.";
