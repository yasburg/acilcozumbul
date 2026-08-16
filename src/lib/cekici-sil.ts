import { getCekiciById } from "./db";
import { deletePrefix } from "./file-storage";
import { getSupabaseAdmin } from "./supabase/admin";
import { cekiciAuthKullaniciSil } from "./cekici-auth";

async function cekiciDosyalariniSil(cekiciId: string): Promise<void> {
  await Promise.all([
    deletePrefix("cekici-belgeler", cekiciId),
    deletePrefix("cekici-profil-fotograflari", cekiciId),
  ]);
}

/** Panel: çekici ve ilişkili kayıtları siler */
export async function silCekiciCascade(id: string): Promise<void> {
  const cekici = await getCekiciById(id);
  if (!cekici) {
    throw new Error("Çekici bulunamadı.");
  }

  const sb = getSupabaseAdmin();

  const { error: davetErr } = await sb
    .from("davet_kullanimlari")
    .delete()
    .or(`davet_eden_id.eq.${id},yeni_cekici_id.eq.${id}`);
  if (davetErr) throw davetErr;

  const { error: davetEdenErr } = await sb
    .from("cekiciler")
    .update({ davet_eden_id: null })
    .eq("davet_eden_id", id);
  if (davetEdenErr) throw davetEdenErr;

  const { error: odemeErr } = await sb
    .from("kredi_odemeler")
    .delete()
    .eq("cekici_id", id);
  if (odemeErr) throw odemeErr;

  const { error: smsErr } = await sb.from("sms_log").delete().eq("cekici_id", id);
  if (smsErr) throw smsErr;

  const { error: otpErr } = await sb
    .from("cekici_sifre_otp")
    .delete()
    .eq("telefon", cekici.telefon);
  if (otpErr) throw otpErr;

  await sb.from("cekici_kayit_otp").delete().eq("telefon", cekici.telefon);

  try {
    await cekiciDosyalariniSil(id);
  } catch (e) {
    console.warn("[cekici-sil] volume silinemedi:", e);
  }

  if (cekici.authUserId) {
    await cekiciAuthKullaniciSil(cekici.authUserId);
  }

  const { error: cekiciErr } = await sb.from("cekiciler").delete().eq("id", id);
  if (cekiciErr) throw cekiciErr;
}
