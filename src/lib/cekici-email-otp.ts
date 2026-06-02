import { randomInt } from "crypto";
import { getCekiciById, updateCekici } from "./db";
import { epostaGecerliMi, epostaDogrulamaHatasi, epostaNormalize } from "./eposta";
import { epostaGonder } from "./email-gonder";
import { getSupabaseAdmin } from "./supabase/admin";

const OTP_SURE_DK = 10;
const MAX_DENEME = 5;
const YENIDEN_GONDER_SN = 60;

export type EmailOtpKayit = {
  cekiciId: string;
  email: string;
  kod: string;
  olusturulma: string;
  sonGonderim: string;
  deneme: number;
  dogrulandi: boolean;
};

type EmailOtpRow = {
  cekici_id: string;
  email: string;
  kod: string;
  olusturulma: string;
  son_gonderim: string;
  deneme: number;
  dogrulandi: boolean;
};

function fromRow(r: EmailOtpRow): EmailOtpKayit {
  return {
    cekiciId: r.cekici_id,
    email: r.email,
    kod: r.kod,
    olusturulma: r.olusturulma,
    sonGonderim: r.son_gonderim,
    deneme: r.deneme,
    dogrulandi: r.dogrulandi,
  };
}

function toRow(k: EmailOtpKayit): EmailOtpRow {
  return {
    cekici_id: k.cekiciId,
    email: k.email,
    kod: k.kod,
    olusturulma: k.olusturulma,
    son_gonderim: k.sonGonderim,
    deneme: k.deneme,
    dogrulandi: k.dogrulandi,
  };
}

async function otpGet(cekiciId: string, email: string): Promise<EmailOtpKayit | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_email_otp")
    .select("*")
    .eq("cekici_id", cekiciId)
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as EmailOtpRow) : undefined;
}

async function otpUpsert(kayit: EmailOtpKayit): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cekici_email_otp")
    .upsert(toRow(kayit), { onConflict: "cekici_id,email" });
  if (error) throw error;
}

function otpSuresiDolduMu(kayit: EmailOtpKayit): boolean {
  return Date.now() - new Date(kayit.olusturulma).getTime() > OTP_SURE_DK * 60 * 1000;
}

export async function cekiciEpostaDogrulandiMi(
  cekiciId: string,
  emailHam: string
): Promise<boolean> {
  if (!epostaGecerliMi(emailHam)) return false;
  const email = epostaNormalize(emailHam);
  const cekici = await getCekiciById(cekiciId);
  if (!cekici?.faturaEpostaDogrulandi) return false;
  return (
    epostaNormalize(cekici.faturaEposta ?? "") === email
  );
}

export async function bekleyenCekiciEpostaOtp(
  cekiciId: string,
  emailHam: string
): Promise<{
  bekliyor: boolean;
  yenidenGonderSn: number;
  gelistirmeKodu?: string;
}> {
  if (!epostaGecerliMi(emailHam)) {
    return { bekliyor: false, yenidenGonderSn: 0 };
  }
  const email = epostaNormalize(emailHam);
  const kayit = await otpGet(cekiciId, email);
  if (!kayit || kayit.dogrulandi || otpSuresiDolduMu(kayit)) {
    return { bekliyor: false, yenidenGonderSn: 0 };
  }
  const gecenSn = Math.floor(
    (Date.now() - new Date(kayit.sonGonderim).getTime()) / 1000
  );
  const gelistirmeKodu =
    process.env.NODE_ENV !== "production" || process.env.OTP_DEV_FALLBACK === "true"
      ? kayit.kod
      : undefined;
  return {
    bekliyor: true,
    yenidenGonderSn: Math.max(0, YENIDEN_GONDER_SN - gecenSn),
    gelistirmeKodu,
  };
}

export async function cekiciEpostaOtpGonder(
  cekiciId: string,
  emailHam: string
): Promise<
  | { ok: true; yenidenGonderSn: number; gelistirmeKodu?: string; demo?: boolean }
  | { ok: false; hata: string; yenidenGonderSn?: number }
> {
  if (!epostaGecerliMi(emailHam)) {
    return { ok: false, hata: epostaDogrulamaHatasi(emailHam) };
  }
  const email = epostaNormalize(emailHam);
  const mevcut = await otpGet(cekiciId, email);

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
    cekiciId,
    email,
    kod,
    olusturulma:
      mevcut && !mevcut.dogrulandi && !otpSuresiDolduMu(mevcut)
        ? mevcut.olusturulma
        : simdi,
    sonGonderim: simdi,
    deneme: 0,
    dogrulandi: false,
  });

  const sonuc = await epostaGonder(
    email,
    "acilcozumbul — E-posta doğrulama",
    `Doğrulama kodunuz: ${kod}\n\nBu kod ${OTP_SURE_DK} dakika geçerlidir.`
  );

  if (!sonuc.basarili) {
    return { ok: false, hata: sonuc.hata || "E-posta gönderilemedi." };
  }

  const gelistirmeKodu =
    process.env.NODE_ENV !== "production" || process.env.OTP_DEV_FALLBACK === "true"
      ? kod
      : undefined;

  return {
    ok: true,
    yenidenGonderSn: YENIDEN_GONDER_SN,
    gelistirmeKodu,
    demo: sonuc.demo,
  };
}

export async function cekiciEpostaOtpDogrula(
  cekiciId: string,
  emailHam: string,
  kodHam: string
): Promise<{ ok: true } | { ok: false; hata: string }> {
  if (!epostaGecerliMi(emailHam)) {
    return { ok: false, hata: epostaDogrulamaHatasi(emailHam) };
  }
  const email = epostaNormalize(emailHam);
  const kod = kodHam.trim();
  const kayit = await otpGet(cekiciId, email);

  if (!kayit || otpSuresiDolduMu(kayit)) {
    return { ok: false, hata: "Kod süresi doldu. Yeni kod isteyin." };
  }
  if (kayit.dogrulandi) {
    return { ok: true };
  }
  if (kayit.deneme >= MAX_DENEME) {
    return { ok: false, hata: "Çok fazla deneme. Yeni kod isteyin." };
  }
  if (kayit.kod !== kod) {
    kayit.deneme += 1;
    await otpUpsert(kayit);
    return { ok: false, hata: "Kod hatalı." };
  }

  kayit.dogrulandi = true;
  await otpUpsert(kayit);

  const cekici = await getCekiciById(cekiciId);
  if (cekici) {
    cekici.faturaEposta = email;
    cekici.faturaEpostaDogrulandi = new Date().toISOString();
    await updateCekici(cekici);
  }

  return { ok: true };
}
