import { sendSms, type SmsAliciTipi } from "./sms-provider";
import { WhatsAppTemplates, whatsappAktifMi } from "./whatsapp-provider";

export interface OtpGonderimSonuc {
  basarili: boolean;
  /** Netgsm OTP SMS / WhatsApp kanalı */
  kanal: "otp_sms" | "whatsapp";
  saglayici: string;
  hata?: string;
}

/**
 * Doğrulama kodu — WhatsApp veya Netgsm OTP SMS paketi.
 */
export async function sendOtp(
  telefon: string,
  kod: string,
  meta: {
    aliciTipi: SmsAliciTipi;
    talepId?: string;
    smsMesaj: string;
  }
): Promise<OtpGonderimSonuc> {
  const digits = String(kod).replace(/\D/g, "");
  const mesaj =
    meta.smsMesaj ||
    `acilcozumbul.com dogrulama kodunuz: ${digits}. 5 dakika gecerlidir.`;

  const sms = await sendSms(telefon, mesaj, {
    aliciTipi: meta.aliciTipi,
    talepId: meta.talepId,
    krediDus: false,
    kanal: "otp",
    whatsappTemplate: WhatsAppTemplates.otp(digits),
  });

  const kanal = sms.saglayici === "whatsapp" ? "whatsapp" : "otp_sms";

  return {
    basarili: sms.basarili,
    kanal,
    saglayici: sms.saglayici,
    hata: sms.hata,
  };
}

export function otpBasariMesaji(telefonMaskeli: string): string {
  const kanal = whatsappAktifMi() ? "WhatsApp / SMS" : "SMS";
  return `${telefonMaskeli} numarasına ${kanal} ile doğrulama kodu gönderildi.`;
}

export function otpBekleyenMesaji(): string {
  return "Kod zaten gönderildi. SMS'teki 6 haneli kodu girin.";
}

export function otpGelmediMesaji(): string {
  return "SMS şu an gitmedi (test ortamı). Ekrandaki geliştirme kodunu girin.";
}

export function otpHataMesaji(): string {
  return "Doğrulama kodu gönderilemedi. Lütfen bir dakika sonra tekrar deneyin.";
}
