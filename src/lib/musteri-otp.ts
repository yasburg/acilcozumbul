import { randomInt } from "crypto";
import { getSupabaseAdmin } from "./supabase/admin";
import { type OtpRow } from "./supabase/mappers";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "./telefon";

const OTP_SURE_DK = 5;
const MAX_DENEME = 5;
const YENIDEN_GONDER_SN = 60;

export interface OtpKayit {
  telefon: string;
  kod: string;
  olusturulma: string;
  sonGonderim: string;
  deneme: number;
  dogrulandi: boolean;
}

function otpFromRow(r: OtpRow): OtpKayit {
  return {
    telefon: r.telefon,
    kod: r.kod,
    olusturulma: r.olusturulma,
    sonGonderim: r.son_gonderim,
    deneme: r.deneme,
    dogrulandi: r.dogrulandi,
  };
}

function otpToRow(k: OtpKayit): OtpRow {
  return {
    telefon: k.telefon,
    kod: k.kod,
    olusturulma: k.olusturulma,
    son_gonderim: k.sonGonderim,
    deneme: k.deneme,
    dogrulandi: k.dogrulandi,
  };
}

async function otpGet(telefon: string): Promise<OtpKayit | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from("telefon_otp")
    .select("*")
    .eq("telefon", telefon)
    .maybeSingle();
  if (error) throw error;
  return data ? otpFromRow(data as OtpRow) : undefined;
}

async function otpUpsert(kayit: OtpKayit): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("telefon_otp")
    .upsert(otpToRow(kayit), { onConflict: "telefon" });
  if (error) throw error;
}

async function otpSil(telefon: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("telefon_otp")
    .delete()
    .eq("telefon", telefon);
  if (error) throw error;
}

async function otpEskiKayitlariTemizle(): Promise<void> {
  const sinir = new Date(
    Date.now() - OTP_SURE_DK * 60 * 1000 * 3
  ).toISOString();
  const { error } = await getSupabaseAdmin()
    .from("telefon_otp")
    .delete()
    .eq("dogrulandi", false)
    .lt("olusturulma", sinir);
  if (error) throw error;
}

export function otpSuresiDolduMu(kayit: OtpKayit): boolean {
  return Date.now() - new Date(kayit.olusturulma).getTime() > OTP_SURE_DK * 60 * 1000;
}

export async function bekleyenOtpBilgisi(telefonHam: string): Promise<{
  bekliyor: boolean;
  yenidenGonderSn: number;
  gelistirmeKodu?: string;
  telefon?: string;
}> {
  if (!telefonGecerliMi(telefonHam)) {
    return { bekliyor: false, yenidenGonderSn: 0 };
  }

  await otpEskiKayitlariTemizle();
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

export async function otpGonder(
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

  await otpEskiKayitlariTemizle();
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
  const yeni: OtpKayit = {
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

export async function otpDogrula(
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

  if (!kayit || kayit.dogrulandi) {
    return { ok: false, hata: "Kod bulunamadı. Yeni kod isteyin." };
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

export async function otpTemizle(telefonHam: string): Promise<void> {
  if (!telefonGecerliMi(telefonHam)) return;
  const telefon = telefonNormalize(telefonHam);
  await otpSil(telefon);
}

export async function telefonDogrulandiMi(telefonHam: string): Promise<boolean> {
  const telefon = telefonNormalize(telefonHam);
  const kayit = await otpGet(telefon);
  if (!kayit?.dogrulandi) return false;
  return Date.now() - new Date(kayit.olusturulma).getTime() < 30 * 60 * 1000;
}
