import { randomInt } from "crypto";
import { getSupabaseAdmin } from "./supabase/admin";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "./telefon";

const OTP_SURE_DK = 5;
const MAX_DENEME = 5;
const YENIDEN_GONDER_SN = 60;

export interface CekiciSifreOtpKayit {
  telefon: string;
  kod: string;
  olusturulma: string;
  sonGonderim: string;
  deneme: number;
  dogrulandi: boolean;
}

type CekiciSifreOtpRow = {
  telefon: string;
  kod: string;
  olusturulma: string;
  son_gonderim: string;
  deneme: number;
  dogrulandi: boolean;
};

function fromRow(r: CekiciSifreOtpRow): CekiciSifreOtpKayit {
  return {
    telefon: r.telefon,
    kod: r.kod,
    olusturulma: r.olusturulma,
    sonGonderim: r.son_gonderim,
    deneme: r.deneme,
    dogrulandi: r.dogrulandi,
  };
}

function toRow(k: CekiciSifreOtpKayit): CekiciSifreOtpRow {
  return {
    telefon: k.telefon,
    kod: k.kod,
    olusturulma: k.olusturulma,
    son_gonderim: k.sonGonderim,
    deneme: k.deneme,
    dogrulandi: k.dogrulandi,
  };
}

async function otpGet(telefon: string): Promise<CekiciSifreOtpKayit | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_sifre_otp")
    .select("*")
    .eq("telefon", telefon)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as CekiciSifreOtpRow) : undefined;
}

async function otpUpsert(kayit: CekiciSifreOtpKayit): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekici_sifre_otp")
    .upsert(toRow(kayit), { onConflict: "telefon" });
  if (error) throw error;
}

async function otpSil(telefon: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekici_sifre_otp")
    .delete()
    .eq("telefon", telefon);
  if (error) throw error;
}

function otpSuresiDolduMu(kayit: CekiciSifreOtpKayit): boolean {
  return Date.now() - new Date(kayit.olusturulma).getTime() > OTP_SURE_DK * 60 * 1000;
}

export async function bekleyenCekiciSifreOtp(telefonHam: string): Promise<{
  bekliyor: boolean;
  yenidenGonderSn: number;
  gelistirmeKodu?: string;
  telefon?: string;
}> {
  if (!telefonGecerliMi(telefonHam)) {
    return { bekliyor: false, yenidenGonderSn: 0 };
  }

  const telefon = telefonNormalize(telefonHam);
  const kayit = await otpGet(telefon);

  if (!kayit || kayit.dogrulandi || otpSuresiDolduMu(kayit)) {
    return { bekliyor: false, yenidenGonderSn: 0 };
  }

  const gecenSn = Math.floor(
    (Date.now() - new Date(kayit.sonGonderim).getTime()) / 1000
  );
  const yenidenGonderSn = Math.max(0, YENIDEN_GONDER_SN - gecenSn);
  const gelistirmeKodu =
    process.env.NODE_ENV !== "production" || process.env.OTP_DEV_FALLBACK === "true"
      ? kayit.kod
      : undefined;

  return { bekliyor: true, yenidenGonderSn, gelistirmeKodu, telefon };
}

export async function cekiciSifreOtpGonder(
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
    return { ok: false, hata: telefonDogrulamaHatasi(telefonHam) };
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
  const yeni: CekiciSifreOtpKayit = {
    telefon,
    kod,
    olusturulma:
      mevcut && !mevcut.dogrulandi && !otpSuresiDolduMu(mevcut)
        ? mevcut.olusturulma
        : simdi,
    sonGonderim: simdi,
    deneme: 0,
    dogrulandi: false,
  };

  await otpUpsert(yeni);

  const gelistirmeKodu =
    process.env.NODE_ENV !== "production" || process.env.OTP_DEV_FALLBACK === "true"
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

export async function cekiciSifreOtpDogrula(
  telefonHam: string,
  kodHam: string
): Promise<{ ok: true; telefon: string } | { ok: false; hata: string }> {
  if (!telefonGecerliMi(telefonHam)) {
    return { ok: false, hata: "Geçersiz telefon." };
  }

  const kod = kodHam.replace(/\D/g, "").trim();
  if (kod.length !== 6) {
    return { ok: false, hata: "6 haneli doğrulama kodunu girin." };
  }

  const telefon = telefonNormalize(telefonHam);
  const kayit = await otpGet(telefon);

  if (!kayit) {
    return { ok: false, hata: "Kod bulunamadı. Yeni kod isteyin." };
  }

  if (kayit.dogrulandi) {
    return { ok: true, telefon };
  }

  if (otpSuresiDolduMu(kayit)) {
    return { ok: false, hata: "Kodun süresi doldu. Yeni kod isteyin." };
  }

  if (kayit.deneme >= MAX_DENEME) {
    return { ok: false, hata: "Çok fazla hatalı deneme. Yeni kod isteyin." };
  }

  if (kayit.kod !== kod) {
    kayit.deneme += 1;
    await otpUpsert(kayit);
    const kalan = MAX_DENEME - kayit.deneme;
    return {
      ok: false,
      hata:
        kalan > 0
          ? `Doğrulama kodu hatalı. ${kalan} deneme hakkınız kaldı.`
          : "Doğrulama kodu hatalı. Çok fazla deneme — yeni kod isteyin.",
    };
  }

  kayit.dogrulandi = true;
  await otpUpsert(kayit);
  return { ok: true, telefon };
}

export async function cekiciSifreOtpTemizle(telefonHam: string): Promise<void> {
  if (!telefonGecerliMi(telefonHam)) return;
  await otpSil(telefonNormalize(telefonHam));
}
