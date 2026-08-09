/**
 * Netgsm sesli mesaj şablonları (tek tip kayıtlar) + talep/kredi tetik helper’ları.
 */

import {
  sendVoiceByAudioId,
  type VoiceGonderimSonuc,
} from "./netgsm-sesli";
import {
  sesliCekiciDtmfAktifMi,
  sesliDtmfOtpKeyInfo,
  sesliWebhookUrl,
} from "./netgsm-sesli-webhook";
import { sesliMesajGonderimKaydet } from "./sesli-mesaj-log";
import { telefonGecerliMi } from "./telefon";

export type SesliMesajSablonId =
  | "musteri_talep_alindi"
  | "cekici_yeni_talep"
  | "cekici_yetersiz_kredi";

export type SesliMesajSablon = {
  id: SesliMesajSablonId;
  label: string;
  aciklama: string;
  /** Netgsm AudioID — yoksa demo’da elle girilir */
  audioId: string | null;
  sureSn?: number;
};

/** Netgsm Ses Kayıtları — müşteri talep alındı */
export const MUSTERI_TALEP_ALINDI_AUDIO_ID_DEFAULT = "170247953";
/** Netgsm Ses Kayıtları — çekici / hizmet veren acil talep bildirimi */
export const CEKICI_YENI_TALEP_AUDIO_ID_DEFAULT = "170280647";
/** Netgsm Ses Kayıtları — yetersiz kredi hatırlatma */
export const CEKICI_YETERSIZ_KREDI_AUDIO_ID_DEFAULT = "170249942";

export function sesliMesajSablonlari(): SesliMesajSablon[] {
  const musteriId =
    process.env.NETGSM_VOICE_MUSTERI_AUDIO_ID?.trim() ||
    MUSTERI_TALEP_ALINDI_AUDIO_ID_DEFAULT;
  const cekiciId =
    process.env.NETGSM_VOICE_CEKICI_AUDIO_ID?.trim() ||
    CEKICI_YENI_TALEP_AUDIO_ID_DEFAULT;
  const yetersizKrediId =
    process.env.NETGSM_VOICE_YETERSIZ_KREDI_AUDIO_ID?.trim() ||
    CEKICI_YETERSIZ_KREDI_AUDIO_ID_DEFAULT;

  return [
    {
      id: "musteri_talep_alindi",
      label: "Müşteri — talep alındı",
      aciklama:
        "Çekiciler aranıyor, teklifler gelecek; bir-iki dakika bekleyin (SMS/site).",
      audioId: musteriId || null,
      sureSn: 29,
    },
    {
      id: "cekici_yeni_talep",
      label: "Çekici — yeni talep",
      aciklama:
        "Bölgede talep var; SMS / siteyi kontrol edin. Kayıtta «9’a basarsanız bildirim hızlı SMS (OTP) olur, sesli arama kapanır» söyleyin — DTMF tuş 9 → seviye 2.",
      audioId: cekiciId || null,
      sureSn: 28,
    },
    {
      id: "cekici_yetersiz_kredi",
      label: "Çekici — yetersiz kredi",
      aciklama:
        "SMS ile aynı kural: kredisi yetmeyene en fazla 3 kez; otomatikte aralarında ≥24 saat.",
      audioId: yetersizKrediId || null,
      sureSn: 22,
    },
  ];
}

export function sesliMesajSablonBul(
  id: string
): SesliMesajSablon | undefined {
  return sesliMesajSablonlari().find((s) => s.id === id);
}

export async function sesliMesajGonder(
  sablonId: SesliMesajSablonId,
  telefon: string,
  opts?: { relationid?: string }
): Promise<VoiceGonderimSonuc> {
  if (!telefonGecerliMi(telefon)) {
    return { basarili: false, hata: `Geçersiz telefon: ${telefon}` };
  }
  const sablon = sesliMesajSablonBul(sablonId);
  if (!sablon?.audioId) {
    return { basarili: false, hata: `AudioID yok: ${sablonId}` };
  }

  const webhookUrl = sesliWebhookUrl();
  const dtmfAcik =
    sablonId === "cekici_yeni_talep" &&
    sesliCekiciDtmfAktifMi() &&
    Boolean(webhookUrl);

  const sonuc = await sendVoiceByAudioId({
    telefon,
    audioId: sablon.audioId,
    relationid: opts?.relationid,
    ...(webhookUrl
      ? {
          url: webhookUrl,
          ...(dtmfAcik
            ? { key: 1 as const, keyinfo: [sesliDtmfOtpKeyInfo()] }
            : { key: 0 as const }),
        }
      : {}),
  });

  void sesliMesajGonderimKaydet({
    sablonId,
    telefon,
    basarili: sonuc.basarili,
    hata: sonuc.hata,
    bulkid: sonuc.bulkid,
    relationid: opts?.relationid,
    audioId: sablon.audioId,
  });

  return sonuc;
}

/** Çekici yeni talep seslisi: aynı numaraya en az bu kadar aralık (ms) */
export const SESLI_CEKICI_TALEP_RATE_MS = 60_000;

const sonCekiciTalepSesli = new Map<string, number>();

/**
 * Çekici talep seslisi için basit rate-limit (process içi).
 * true = gönderilebilir; false = çok sık, atla.
 */
export function sesliCekiciTalepRateLimitGecerMi(
  telefon: string,
  now = Date.now()
): boolean {
  const key = telefon.trim();
  if (!key) return false;
  const last = sonCekiciTalepSesli.get(key) ?? 0;
  if (now - last < SESLI_CEKICI_TALEP_RATE_MS) return false;
  sonCekiciTalepSesli.set(key, now);
  /* bellek sızıntısı olmasın — eski kayıtları seyrek temizle */
  if (sonCekiciTalepSesli.size > 5000) {
    for (const [k, t] of sonCekiciTalepSesli) {
      if (now - t > SESLI_CEKICI_TALEP_RATE_MS * 2) sonCekiciTalepSesli.delete(k);
    }
  }
  return true;
}

/** Testler için */
export function sesliCekiciTalepRateLimitSifirla(): void {
  sonCekiciTalepSesli.clear();
}

/** Talebi bozmaz; hata yalnızca loglanır. Yalnız başarılı SMS sonrası çağırın. */
export function sesliMesajFireAndForget(
  sablonId: SesliMesajSablonId,
  telefon: string,
  logEtiket: string,
  opts?: { relationid?: string }
): void {
  void sesliMesajGonder(sablonId, telefon, opts)
    .then((r) => {
      if (!r.basarili) {
        console.error(`[sesli] ${logEtiket}`, r.hata ?? "başarısız");
      }
    })
    .catch((e) => {
      console.error(`[sesli] ${logEtiket}`, e);
    });
}
