/**
 * Netgsm sesli mesaj webhook (DTMF) — çekici tuş 9 ile OTP SMS (seviye 2).
 */

import { getCekiciById, getCekiciByTelefon, updateCekici } from "./db";
import { smsBaseUrl } from "./sms-base-url";
import { telefonNormalize } from "./telefon";
import type { VoiceKeyInfo } from "./netgsm-sesli";

/** Çekici talep seslisinde: 9 → hızlı OTP SMS (seviye 2); sesli arama kapanır */
export const SESLI_DTMF_OTP_TUS = 9;

/** @deprecated SESLI_DTMF_OTP_TUS */
export const SESLI_DTMF_SMS_ONLY_TUS = SESLI_DTMF_OTP_TUS;

export const SESLI_DTMF_OTP_ONAY_METIN_DEFAULT =
  "Bildirim ayariniz hizli SMS olarak guncellendi. Sesli arama kapandi.";

/** @deprecated SESLI_DTMF_OTP_ONAY_METIN_DEFAULT */
export const SESLI_DTMF_SMS_ONLY_ONAY_METIN_DEFAULT =
  SESLI_DTMF_OTP_ONAY_METIN_DEFAULT;

/** relationid: t:{talepId}:c:{cekiciId} */
export function sesliRelationCekiciIdParse(
  relationid: string | null | undefined
): string | null {
  const raw = String(relationid ?? "").trim();
  const m = /^t:[a-zA-Z0-9_-]+:c:([a-zA-Z0-9_-]+)$/.exec(raw);
  return m?.[1] ?? null;
}

export function sesliWebhookSecretBeklenen(): string | null {
  const s = process.env.NETGSM_VOICE_WEBHOOK_SECRET?.trim();
  return s || null;
}

export function sesliWebhookSecretGecerliMi(
  gelen: string | null | undefined
): boolean {
  const beklenen = sesliWebhookSecretBeklenen();
  if (!beklenen) return false;
  return String(gelen ?? "") === beklenen;
}

/**
 * DTMF açılsın mı: secret + kapatma bayrağı yok.
 * Yerel URL Netgsm’e ulaşamaz; smsBaseUrl canlı domain kullanır.
 */
export function sesliCekiciDtmfAktifMi(): boolean {
  if (process.env.NETGSM_VOICE_DTMF_ENABLED?.trim() === "0") return false;
  if (!sesliWebhookSecretBeklenen()) return false;
  return true;
}

export function sesliWebhookUrl(): string | null {
  const secret = sesliWebhookSecretBeklenen();
  if (!secret) return null;
  const base = smsBaseUrl();
  const u = new URL("/api/webhooks/netgsm/sesli", base);
  u.searchParams.set("secret", secret);
  return u.toString();
}

export function sesliDtmfOtpOnayMetin(): string {
  return (
    process.env.NETGSM_VOICE_DTMF_OTP_TEXT?.trim() ||
    process.env.NETGSM_VOICE_DTMF_SMS_ONLY_TEXT?.trim() ||
    SESLI_DTMF_OTP_ONAY_METIN_DEFAULT
  );
}

/** @deprecated sesliDtmfOtpOnayMetin */
export function sesliDtmfSmsOnlyOnayMetin(): string {
  return sesliDtmfOtpOnayMetin();
}

/** Tuş 9 onay sesi (AudioID) — yoksa TTS metin. Yalnız bu tuş tanımlı; diğerleri yok. */
export function sesliDtmfOtpKeyInfo(): VoiceKeyInfo {
  const audioId =
    process.env.NETGSM_VOICE_DTMF_OTP_AUDIO_ID?.trim() ||
    process.env.NETGSM_VOICE_DTMF_SMS_ONLY_AUDIO_ID?.trim();
  if (audioId && /^\d+$/.test(audioId)) {
    return { tus: SESLI_DTMF_OTP_TUS, audioId };
  }
  return { tus: SESLI_DTMF_OTP_TUS, text: sesliDtmfOtpOnayMetin() };
}

/** @deprecated sesliDtmfOtpKeyInfo */
export function sesliDtmfSmsOnlyKeyInfo(): VoiceKeyInfo {
  return sesliDtmfOtpKeyInfo();
}

export type NetgsmSesliWebhookPayload = {
  bulkid?: number | string | null;
  caller?: string | null;
  callee?: string | null;
  state?: number | string | null;
  type?: number | string | null;
  relationid?: string | null;
  answer_time?: string | null;
  bilsec?: number | string | null;
  push_button?: number | string | null;
  detail?: {
    push_button?: number | string | null;
    survey_push_button_desc?: string | null;
    survey_taskid?: string | null;
    record_link?: string | null;
  } | null;
};

export function sesliWebhookState(
  body: NetgsmSesliWebhookPayload
): number | null {
  const raw = body.state;
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

export function sesliWebhookPushButton(
  body: NetgsmSesliWebhookPayload
): number | null {
  const raw = body.detail?.push_button ?? body.push_button;
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * Tuş 9 → bildirimSeviye=2 (OTP / hızlı SMS). Diğer tuşlar no-op.
 */
export async function sesliWebhookDtmfIsle(
  body: NetgsmSesliWebhookPayload
): Promise<{
  islem: "otp_sms" | "yok" | "bulunamadi";
  cekiciId?: string;
  pushButton: number | null;
  state: number | null;
}> {
  const pushButton = sesliWebhookPushButton(body);
  const state = sesliWebhookState(body);

  if (pushButton !== SESLI_DTMF_OTP_TUS) {
    return { islem: "yok", pushButton, state };
  }

  let cekiciId = sesliRelationCekiciIdParse(body.relationid ?? undefined);
  let cekici = cekiciId ? await getCekiciById(cekiciId) : undefined;

  if (!cekici && body.callee) {
    const tel = telefonNormalize(String(body.callee));
    cekici = await getCekiciByTelefon(tel);
    cekiciId = cekici?.id ?? null;
  }

  if (!cekici) {
    return {
      islem: "bulunamadi",
      cekiciId: cekiciId ?? undefined,
      pushButton,
      state,
    };
  }

  cekici.bildirimSeviye = 2;
  cekici.premiumSmsAktif = true;
  await updateCekici(cekici);

  return { islem: "otp_sms", cekiciId: cekici.id, pushButton, state };
}
