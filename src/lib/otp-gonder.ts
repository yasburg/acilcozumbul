import { sendSms, type SmsAliciTipi } from "./sms-provider";

export interface OtpGonderimSonuc {
  basarili: boolean;
  /** Netgsm OTP SMS kanalı */
  kanal: "otp_sms";
  saglayici: string;
  hata?: string;
}

/**
 * Doğrulama kodu — Netgsm OTP SMS paketi (öncelikli teslim).
 * @see https://api.netgsm.com.tr/sms/rest/v2/otp
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
  });

  return {
    basarili: sms.basarili,
    kanal: "otp_sms",
    saglayici: sms.saglayici,
    hata: sms.hata,
  };
}

export function otpBasariMesaji(telefonMaskeli: string): string {
  return `${telefonMaskeli} numarasına SMS ile doğrulama kodu gönderildi.`;
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
