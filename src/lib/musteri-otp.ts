import { randomInt } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { telefonGecerliMi, telefonNormalize } from "./telefon";

const DATA_FILE = path.join(process.cwd(), "data", "telefon-otp.json");
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

async function otpOku(): Promise<OtpKayit[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as OtpKayit[];
  } catch {
    return [];
  }
}

async function otpYaz(liste: OtpKayit[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const simdi = Date.now();
  const temiz = liste.filter(
    (k) =>
      simdi - new Date(k.olusturulma).getTime() < OTP_SURE_DK * 60 * 1000 * 3 ||
      k.dogrulandi
  );
  await fs.writeFile(DATA_FILE, JSON.stringify(temiz, null, 2), "utf-8");
}

function kodUret(): string {
  return String(randomInt(100000, 999999));
}

export function otpSuresiDolduMu(kayit: OtpKayit): boolean {
  return Date.now() - new Date(kayit.olusturulma).getTime() > OTP_SURE_DK * 60 * 1000;
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
    return { ok: false, hata: "Geçerli bir cep telefonu girin (05XX XXX XX XX)." };
  }

  const telefon = telefonNormalize(telefonHam);
  const liste = await otpOku();
  const mevcut = liste.find((k) => k.telefon === telefon && !k.dogrulandi);

  if (mevcut) {
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

  const kod = kodUret();
  const simdi = new Date().toISOString();
  const yeni: OtpKayit = {
    telefon,
    kod,
    olusturulma: mevcut && !otpSuresiDolduMu(mevcut) ? mevcut.olusturulma : simdi,
    sonGonderim: simdi,
    deneme: 0,
    dogrulandi: false,
  };

  const diger = liste.filter((k) => k.telefon !== telefon);
  await otpYaz([...diger, yeni]);

  const gelistirmeKodu =
    process.env.NODE_ENV !== "production" ? kod : undefined;

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
  const liste = await otpOku();
  const kayit = liste.find((k) => k.telefon === telefon && !k.dogrulandi);

  if (!kayit) {
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
    await otpYaz(liste);
    const kalan = MAX_DENEME - kayit.deneme;
    return {
      ok: false,
      hata:
        kalan > 0
          ? `Hatalı kod. ${kalan} deneme hakkınız kaldı.`
          : "Çok fazla hatalı deneme. Yeni kod isteyin.",
    };
  }

  kayit.dogrulandi = true;
  await otpYaz(liste);
  return { ok: true, telefon };
}

export async function telefonDogrulandiMi(telefonHam: string): Promise<boolean> {
  const telefon = telefonNormalize(telefonHam);
  const liste = await otpOku();
  const kayit = liste.find((k) => k.telefon === telefon && k.dogrulandi);
  if (!kayit) return false;
  // Doğrulama 30 dk geçerli
  return Date.now() - new Date(kayit.olusturulma).getTime() < 30 * 60 * 1000;
}
