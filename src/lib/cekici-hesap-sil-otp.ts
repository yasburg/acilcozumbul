import { randomInt } from "crypto";
import { getSupabaseAdmin } from "./supabase/admin";
import { telefonGecerliMi, telefonNormalize } from "./telefon";

const OTP_SURE_DK = 5;
const MAX_DENEME = 5;
const YENIDEN_GONDER_SN = 60;

export {
  HESAP_SIL_ONAY_METNI,
  hesapSilOnayMetniGecerliMi,
} from "./cekici-hesap-sil-onay";

export interface CekiciHesapSilOtpKayit {
  telefon: string;
  kod: string;
  olusturulma: string;
  sonGonderim: string;
  deneme: number;
  dogrulandi: boolean;
}

type Row = {
  telefon: string;
  kod: string;
  olusturulma: string;
  son_gonderim: string;
  deneme: number;
  dogrulandi: boolean;
};

function fromRow(r: Row): CekiciHesapSilOtpKayit {
  return {
    telefon: r.telefon,
    kod: r.kod,
    olusturulma: r.olusturulma,
    sonGonderim: r.son_gonderim,
    deneme: r.deneme,
    dogrulandi: r.dogrulandi,
  };
}

function toRow(k: CekiciHesapSilOtpKayit): Row {
  return {
    telefon: k.telefon,
    kod: k.kod,
    olusturulma: k.olusturulma,
    son_gonderim: k.sonGonderim,
    deneme: k.deneme,
    dogrulandi: k.dogrulandi,
  };
}

async function otpGet(
  telefon: string
): Promise<CekiciHesapSilOtpKayit | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_hesap_sil_otp")
    .select("*")
    .eq("telefon", telefon)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Row) : undefined;
}

async function otpUpsert(kayit: CekiciHesapSilOtpKayit): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekici_hesap_sil_otp")
    .upsert(toRow(kayit), { onConflict: "telefon" });
  if (error) throw error;
}

export async function cekiciHesapSilOtpSil(telefonHam: string): Promise<void> {
  const telefon = telefonNormalize(telefonHam);
  const { error } = await getSupabaseAdmin()
    .from("cekici_hesap_sil_otp")
    .delete()
    .eq("telefon", telefon);
  if (error) throw error;
}

function otpSuresiDolduMu(kayit: CekiciHesapSilOtpKayit): boolean {
  return (
    Date.now() - new Date(kayit.olusturulma).getTime() > OTP_SURE_DK * 60 * 1000
  );
}

export async function cekiciHesapSilOtpOlustur(
  telefonHam: string
): Promise<
  | {
      ok: true;
      telefon: string;
      kod: string;
      yenidenGonderSn: number;
      gelistirmeKodu?: string;
    }
  | { ok: false; hata: string; yenidenGonderSn?: number }
> {
  if (!telefonGecerliMi(telefonHam)) {
    return { ok: false, hata: "Geçersiz telefon." };
  }

  const telefon = telefonNormalize(telefonHam);
  const mevcut = await otpGet(telefon);

  if (mevcut && !mevcut.dogrulandi) {
    const gecenSn = Math.floor(
      (Date.now() - new Date(mevcut.sonGonderim).getTime()) / 1000
    );
    if (gecenSn < YENIDEN_GONDER_SN) {
      return {
        ok: false,
        hata: `Yeni kod için ${YENIDEN_GONDER_SN - gecenSn} saniye bekleyin.`,
        yenidenGonderSn: YENIDEN_GONDER_SN - gecenSn,
      };
    }
  }

  const kod = String(randomInt(100000, 999999));
  const simdi = new Date().toISOString();
  await otpUpsert({
    telefon,
    kod,
    olusturulma:
      mevcut && !mevcut.dogrulandi && !otpSuresiDolduMu(mevcut)
        ? mevcut.olusturulma
        : simdi,
    sonGonderim: simdi,
    deneme: 0,
    dogrulandi: false,
  });

  const gelistirmeKodu =
    process.env.NODE_ENV !== "production" ||
    process.env.OTP_DEV_FALLBACK === "true"
      ? kod
      : undefined;

  return {
    ok: true,
    telefon,
    kod,
    yenidenGonderSn: YENIDEN_GONDER_SN,
    gelistirmeKodu,
  };
}

export async function cekiciHesapSilOtpDogrula(
  telefonHam: string,
  kodHam: string
): Promise<{ ok: true; telefon: string } | { ok: false; hata: string }> {
  if (!telefonGecerliMi(telefonHam)) {
    return { ok: false, hata: "Geçersiz telefon." };
  }

  const telefon = telefonNormalize(telefonHam);
  const kod = String(kodHam ?? "").replace(/\D/g, "");
  if (kod.length !== 6) {
    return { ok: false, hata: "6 haneli kodu girin." };
  }

  const kayit = await otpGet(telefon);
  if (!kayit) {
    return { ok: false, hata: "Önce telefonunuza kod gönderin." };
  }
  if (kayit.dogrulandi) {
    return { ok: true, telefon };
  }
  if (otpSuresiDolduMu(kayit)) {
    await cekiciHesapSilOtpSil(telefon);
    return { ok: false, hata: "Kodun süresi doldu. Yeni kod isteyin." };
  }
  if (kayit.deneme >= MAX_DENEME) {
    await cekiciHesapSilOtpSil(telefon);
    return { ok: false, hata: "Çok fazla hatalı deneme. Yeni kod isteyin." };
  }

  if (kayit.kod !== kod) {
    await otpUpsert({ ...kayit, deneme: kayit.deneme + 1 });
    return { ok: false, hata: "Kod hatalı." };
  }

  await otpUpsert({ ...kayit, dogrulandi: true });
  return { ok: true, telefon };
}
