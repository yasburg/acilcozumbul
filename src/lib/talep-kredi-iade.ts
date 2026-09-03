import { updateCekici } from "./db";
import {
  cekiciBildirimKrediTutari,
  cekiciBildirimSeviye,
  cekiciTalebeBildirildiMi,
} from "./ihale";
import { cekiciKrediIade, cekiciToplamKredi } from "./kredi-bakiye";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { teklifCashbackKampanyaAktifMi } from "./teklif-cashback-kampanya";
import type { Cekici, Talep } from "./types";

export type TeklifIadeSonuc = {
  iadeEdildi: boolean;
  miktar: number;
  kredi: number;
  zatenIade?: boolean;
  kampanyaKapali?: boolean;
};

async function talepKrediIadeTablosuVar(): Promise<boolean> {
  if (!supabaseDbAktif()) return false;
  const { error } = await getSupabaseAdmin()
    .from("talep_kredi_iade")
    .select("cekici_id")
    .limit(1);
  if (!error) return true;
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  if (code === "42P01" || code === "PGRST205") return false;
  throw error;
}

export async function talepKrediIadeVarMi(
  cekiciId: string,
  talepId: string
): Promise<boolean> {
  if (!(await talepKrediIadeTablosuVar())) return false;
  const { data, error } = await getSupabaseAdmin()
    .from("talep_kredi_iade")
    .select("cekici_id")
    .eq("cekici_id", cekiciId)
    .eq("talep_id", talepId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/**
 * İlk tekliften sonra bildirim paketi tutarını iade et (idempotent).
 * Kampanya kapalıysa / tablo yoksa no-op.
 */
export async function teklifIadeEt(
  cekici: Cekici,
  talep: Pick<Talep, "id" | "bildirilenCekiciIds">
): Promise<TeklifIadeSonuc> {
  const kredi = cekiciToplamKredi(cekici);

  if (!(await teklifCashbackKampanyaAktifMi())) {
    return { iadeEdildi: false, miktar: 0, kredi, kampanyaKapali: true };
  }

  if (!cekiciTalebeBildirildiMi(talep as Talep, cekici.id)) {
    return { iadeEdildi: false, miktar: 0, kredi };
  }

  if (!(await talepKrediIadeTablosuVar())) {
    return { iadeEdildi: false, miktar: 0, kredi };
  }

  if (await talepKrediIadeVarMi(cekici.id, talep.id)) {
    return { iadeEdildi: false, miktar: 0, kredi, zatenIade: true };
  }

  const seviye = cekiciBildirimSeviye(cekici);
  const miktar = cekiciBildirimKrediTutari(cekici);

  const { error: insertErr } = await getSupabaseAdmin()
    .from("talep_kredi_iade")
    .insert({
      cekici_id: cekici.id,
      talep_id: talep.id,
      miktar,
      bildirim_seviye: seviye,
      iade_edildi_at: new Date().toISOString(),
    });

  if (insertErr) {
    const code =
      insertErr && typeof insertErr === "object" && "code" in insertErr
        ? String((insertErr as { code?: string }).code)
        : "";
    // Unique violation — paralel istek
    if (code === "23505") {
      return { iadeEdildi: false, miktar: 0, kredi, zatenIade: true };
    }
    throw insertErr;
  }

  cekiciKrediIade(cekici, miktar);
  await updateCekici(cekici);

  return {
    iadeEdildi: true,
    miktar,
    kredi: cekiciToplamKredi(cekici),
  };
}
