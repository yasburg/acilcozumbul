import { addSmsKaydi } from "./db";
import { sendSms, type SmsAliciTipi, type SmsSaglayici } from "./sms-provider";
import { telefonE164 } from "./telefon";
import { randomUUID } from "crypto";

const NETGSM_WHATSAPP_OTP_URL =
  process.env.NETGSM_WHATSAPP_OTP_URL?.trim() ||
  "https://whatsappapi.netgsm.com.tr/v1/otp";

export type OtpKanal = "whatsapp" | "sms";

export interface OtpGonderimSonuc {
  basarili: boolean;
  kanal: OtpKanal;
  saglayici: SmsSaglayici | "netgsm-whatsapp";
  hata?: string;
}

function netgsmAuthVar(): boolean {
  const usercode =
    process.env.NETGSM_USERCODE ?? process.env.NETGSM_USERNAME;
  return !!(usercode && process.env.NETGSM_PASSWORD);
}

function otpKanalTercihi(): OtpKanal {
  const k = (process.env.OTP_KANAL ?? "whatsapp").trim().toLowerCase();
  return k === "sms" ? "sms" : "whatsapp";
}

function smsFallbackAcik(): boolean {
  const v = (process.env.OTP_SMS_FALLBACK ?? "1").trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "hayir";
}

/**
 * Netgsm WhatsApp OTP
 * @see https://www.netgsm.com.tr/dokuman/ — POST https://whatsappapi.netgsm.com.tr/v1/otp
 */
async function netgsmWhatsAppOtpGonder(
  telefon: string,
  kod: string
): Promise<OtpGonderimSonuc> {
  if (!netgsmAuthVar()) {
    return {
      basarili: false,
      kanal: "whatsapp",
      saglayici: "demo",
      hata: "Netgsm yapılandırılmamış (NETGSM_USERCODE, NETGSM_PASSWORD)",
    };
  }

  const digits = String(kod).replace(/\D/g, "");
  if (!/^\d{1,6}$/.test(digits)) {
    return {
      basarili: false,
      kanal: "whatsapp",
      saglayici: "netgsm-whatsapp",
      hata: "OTP kodu yalnızca 1–6 haneli rakam olmalı",
    };
  }

  const to = telefonE164(telefon);
  if (!to) {
    return {
      basarili: false,
      kanal: "whatsapp",
      saglayici: "netgsm-whatsapp",
      hata: `Geçersiz telefon: ${telefon}`,
    };
  }

  const usercode =
    process.env.NETGSM_USERCODE ?? process.env.NETGSM_USERNAME!;
  const password = process.env.NETGSM_PASSWORD!;
  const auth = Buffer.from(`${usercode}:${password}`).toString("base64");

  try {
    const res = await fetch(NETGSM_WHATSAPP_OTP_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, code: digits }),
    });

    const raw = await res.text();
    let data: { code?: string; description?: string; jobid?: string };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      console.error("[Netgsm WhatsApp OTP] JSON değil:", raw);
      return {
        basarili: false,
        kanal: "whatsapp",
        saglayici: "netgsm-whatsapp",
        hata: raw || `HTTP ${res.status}`,
      };
    }

    if (data.code === "00") {
      return {
        basarili: true,
        kanal: "whatsapp",
        saglayici: "netgsm-whatsapp",
      };
    }

    const hataMesajlari: Record<string, string> = {
      "30": "Geçersiz kullanıcı adı/şifre veya API erişim izni yok",
      "60": "Hesabınızda OTP WhatsApp paketi tanımlı değil",
      "70": "Hatalı parametre (to / code)",
      "80": "WhatsApp netgsm_verify_code şablonu bulunamadı",
      "100": "Netgsm sistem hatası",
    };
    const kodHata = data.code ?? "?";
    const aciklama =
      hataMesajlari[kodHata] ?? data.description ?? raw;
    console.error("[Netgsm WhatsApp OTP]", kodHata, aciklama);
    return {
      basarili: false,
      kanal: "whatsapp",
      saglayici: "netgsm-whatsapp",
      hata: `${kodHata}: ${aciklama}`,
    };
  } catch (err) {
    const hata = err instanceof Error ? err.message : String(err);
    console.error("[Netgsm WhatsApp OTP hata]", hata);
    return {
      basarili: false,
      kanal: "whatsapp",
      saglayici: "netgsm-whatsapp",
      hata,
    };
  }
}

async function otpKaydiYaz(
  telefon: string,
  meta: { aliciTipi: SmsAliciTipi; talepId?: string },
  sonuc: OtpGonderimSonuc,
  kod: string
): Promise<void> {
  await addSmsKaydi({
    id: randomUUID(),
    cekiciId: meta.aliciTipi === "cekici" ? "cekici-otp" : "musteri",
    cekiciTelefon: telefon,
    mesaj: `WhatsApp OTP (${kod.length} hane)`,
    link: "",
    talepId: meta.talepId ?? "otp",
    gonderim: new Date().toISOString(),
    aliciTipi: meta.aliciTipi,
    gonderildi: sonuc.basarili,
    saglayici: sonuc.saglayici,
    hata: sonuc.hata,
  });
}

/**
 * Doğrulama kodu gönderir. Varsayılan: WhatsApp OTP; başarısızsa SMS.
 * OTP_KANAL=sms → yalnızca SMS
 * OTP_SMS_FALLBACK=0 → WhatsApp başarısızsa SMS yok
 */
export async function sendOtp(
  telefon: string,
  kod: string,
  meta: {
    aliciTipi: SmsAliciTipi;
    talepId?: string;
    /** SMS yedek metni (WhatsApp şablonu kodu kendi tarafında gösterir) */
    smsMesaj: string;
  }
): Promise<OtpGonderimSonuc> {
  const tercih = otpKanalTercihi();

  if (tercih === "whatsapp") {
    const wa = await netgsmWhatsAppOtpGonder(telefon, kod);
    await otpKaydiYaz(telefon, meta, wa, kod);
    if (wa.basarili) return wa;

    if (!smsFallbackAcik()) {
      console.log(
        `[OTP WhatsApp başarısız, SMS yedek kapalı] → ${telefon}: ${wa.hata}`
      );
      return wa;
    }
    console.log(
      `[OTP WhatsApp başarısız, SMS yedek] → ${telefon}: ${wa.hata}`
    );
  }

  const sms = await sendSms(telefon, meta.smsMesaj, {
    aliciTipi: meta.aliciTipi,
    talepId: meta.talepId,
    krediDus: false,
  });

  return {
    basarili: sms.basarili,
    kanal: "sms",
    saglayici: sms.saglayici,
    hata: sms.hata,
  };
}

export function otpBasariMesaji(
  telefonMaskeli: string,
  kanal: OtpKanal
): string {
  if (kanal === "whatsapp") {
    return `${telefonMaskeli} numarasına WhatsApp ile doğrulama kodu gönderildi.`;
  }
  return `${telefonMaskeli} numarasına SMS ile doğrulama kodu gönderildi.`;
}

export function otpBekleyenMesaji(kanal: OtpKanal = otpKanalTercihi()): string {
  return kanal === "whatsapp"
    ? "Kod zaten gönderildi. WhatsApp’taki 6 haneli kodu girin."
    : "Kod zaten gönderildi. SMS'teki 6 haneli kodu girin.";
}

export function otpGelmediMesaji(kanal: OtpKanal): string {
  return kanal === "whatsapp"
    ? "WhatsApp şu an gitmedi (test ortamı). Ekrandaki geliştirme kodunu girin."
    : "SMS şu an gitmedi (test ortamı). Ekrandaki geliştirme kodunu girin.";
}

export function otpHataMesaji(): string {
  return "Doğrulama kodu gönderilemedi. Lütfen bir dakika sonra tekrar deneyin.";
}
