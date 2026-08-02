import { randomBytes } from "crypto";
import { smsBaseUrl } from "./sms-base-url";

/** Deep-link token: ~32 byte → base64url (~43 karakter) */
export const FATURA_TOKEN_BYTES = 32;

/** SMS deep-link TTL (PDF ve kayıt saklanmaya devam eder) */
export const FATURA_DEEP_LINK_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export const FATURA_KDV_ORAN = 0.2;

export function faturaTokenUret(): string {
  return randomBytes(FATURA_TOKEN_BYTES).toString("base64url");
}

export function faturaTokenGecerliMi(token: string): boolean {
  return /^[A-Za-z0-9_-]{40,48}$/.test(token);
}

export function faturaDeepLinkExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + FATURA_DEEP_LINK_TTL_MS);
}

export function faturaDeepLinkSuresiDolduMu(
  expiresAt: string | Date,
  now = new Date()
): boolean {
  const t = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return t.getTime() <= now.getTime();
}

export function faturaPath(token: string): string {
  return `/fatura/${token}`;
}

export function faturaUrl(token: string, baseUrl?: string): string {
  return `${smsBaseUrl(baseUrl)}${faturaPath(token)}`;
}

export function faturaSmsMetni(url: string): string {
  return `Faturanız düzenlenmiştir. Görüntülemek için: ${url}`;
}

/** İç belge no — URL'de kullanılmaz; GİB e-Arşiv numarası değildir */
export function faturaBelgeNoUret(from = new Date()): string {
  const y = from.getUTCFullYear();
  const m = String(from.getUTCMonth() + 1).padStart(2, "0");
  const d = String(from.getUTCDate()).padStart(2, "0");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `ACB-${y}${m}${d}-${suffix}`;
}

export type FaturaKdvAyirim = {
  matrah: number;
  kdv: number;
  toplam: number;
  oran: number;
};

/** Brüt tutardan KDV ayrımı (yuvarlama: kuruş) */
export function faturaKdvAyir(
  brutTl: number,
  oran = FATURA_KDV_ORAN
): FaturaKdvAyirim {
  const toplam = Math.round(brutTl * 100) / 100;
  const matrah = Math.round((toplam / (1 + oran)) * 100) / 100;
  const kdv = Math.round((toplam - matrah) * 100) / 100;
  return { matrah, kdv, toplam, oran };
}

/**
 * Deep-link kapısı: oturum + token sahipliği.
 * Enumeration önlemek için başarısız durumlar aynı genel hata koduna düşer.
 */
export type FaturaDeepLinkSonuc =
  | { ok: true; faturaId: string }
  | { ok: false; neden: "giris_gerekli" | "gecersiz" };

export function faturaDeepLinkDegerlendir(opts: {
  oturumCekiciId: string | null;
  kayit:
    | {
        id: string;
        cekiciId: string;
        expiresAt: string;
      }
    | null
    | undefined;
  now?: Date;
}): FaturaDeepLinkSonuc {
  if (!opts.oturumCekiciId) {
    return { ok: false, neden: "giris_gerekli" };
  }
  if (!opts.kayit) {
    return { ok: false, neden: "gecersiz" };
  }
  if (opts.kayit.cekiciId !== opts.oturumCekiciId) {
    return { ok: false, neden: "gecersiz" };
  }
  if (faturaDeepLinkSuresiDolduMu(opts.kayit.expiresAt, opts.now)) {
    return { ok: false, neden: "gecersiz" };
  }
  return { ok: true, faturaId: opts.kayit.id };
}

/** PDF API yetki: 401 / 404 / ok (başka çekici → 404) */
export type FaturaPdfErisim =
  | { ok: true }
  | { ok: false; status: 401 | 404 };

export function faturaPdfErisimKontrol(opts: {
  oturumCekiciId: string | null;
  faturaCekiciId: string | null | undefined;
}): FaturaPdfErisim {
  if (!opts.oturumCekiciId) {
    return { ok: false, status: 401 };
  }
  if (!opts.faturaCekiciId || opts.faturaCekiciId !== opts.oturumCekiciId) {
    return { ok: false, status: 404 };
  }
  return { ok: true };
}
