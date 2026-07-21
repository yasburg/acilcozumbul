import { getSupabaseAdmin, supabaseDbAktif } from "./admin";

let onbellek: boolean | null = null;

export async function topluSmsGecmisTablolariVar(): Promise<boolean> {
  if (onbellek !== null) return onbellek;
  if (!supabaseDbAktif()) {
    onbellek = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_listeler")
    .select("id")
    .limit(1);
  onbellek = !error;
  return onbellek;
}

export const MIGRATION_027_MESAJ =
  "Toplu SMS geçmişi için Supabase’de supabase/migrations/027_panel_toplu_sms_gecmis.sql dosyasını SQL Editor’da çalıştırın.";
