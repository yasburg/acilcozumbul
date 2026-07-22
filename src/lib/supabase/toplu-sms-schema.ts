import { getSupabaseAdmin, supabaseDbAktif } from "./admin";

let gecmisOnbellek: boolean | null = null;
let isOnbellek: boolean | null = null;

export async function topluSmsGecmisTablolariVar(): Promise<boolean> {
  if (gecmisOnbellek !== null) return gecmisOnbellek;
  if (!supabaseDbAktif()) {
    gecmisOnbellek = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_listeler")
    .select("id")
    .limit(1);
  gecmisOnbellek = !error;
  return gecmisOnbellek;
}

export async function topluSmsIsTablolariVar(): Promise<boolean> {
  if (isOnbellek !== null) return isOnbellek;
  if (!supabaseDbAktif()) {
    isOnbellek = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_isler")
    .select("id")
    .limit(1);
  isOnbellek = !error;
  return isOnbellek;
}

export const MIGRATION_027_MESAJ =
  "Toplu SMS geçmişi için Supabase’de supabase/migrations/027_panel_toplu_sms_gecmis.sql dosyasını SQL Editor’da çalıştırın.";

export const MIGRATION_033_MESAJ =
  "Toplu SMS arka plan kuyruğu için Supabase’de supabase/migrations/033_panel_toplu_sms_isler.sql dosyasını SQL Editor’da çalıştırın.";
