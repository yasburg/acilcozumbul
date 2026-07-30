import { randomBytes } from "crypto";
import { cekiciProfilHazirMi } from "./cekici-profil-hazir";
import { smsBaseUrl } from "./sms-base-url";
import type { Cekici } from "./types";

export const KURULUM_HATIRLATMA_TOKEN_LEN = 8;
export const KURULUM_HATIRLATMA_TOKEN_ALFABE =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Tamamlamayanlara en fazla 4 SMS (haftalık dizi) */
export const KURULUM_HATIRLATMA_MAX_GONDERIM = 4;

/** Haftalık ritim */
export const KURULUM_HATIRLATMA_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** Kayıttan hemen sonra spam yok */
export const KURULUM_HATIRLATMA_MIN_YAS_MS = 24 * 60 * 60 * 1000;

export type KurulumHatirlatmaKaynak = "manuel";

export type KurulumHatirlatmaCekiciOzet = {
  cekiciId: string;
  basariliGonderim: number;
  /** Kurulum bitmeden giden başarılı SMS sayısı */
  tamamlanmamisBasarili: number;
  sonBasariliAt: string | null;
  tiklayan: boolean;
  kurulumTamamlandi: boolean;
};

/** 0-based: bir sonraki SMS’in metin indeksi */
export function kurulumHatirlatmaMesajIndex(
  basariliGonderim: number
): number {
  return Math.min(
    Math.max(0, basariliGonderim),
    KURULUM_HATIRLATMA_MAX_GONDERIM - 1
  );
}

/** Netgsm-uyumlu ASCII — hafta 1…4 */
export const KURULUM_HATIRLATMA_SMS_METINLERI = [
  (url: string) =>
    `Hesabiniz hazir degil. Bolgenizi secince yakin talepler SMS gelir. 2 dk: ${url}`,
  (url: string) =>
    `Istanbulda yol yardim talepleri aciliyor. Bolge + hizmet secmeden bildirim gelmez: ${url}`,
  (url: string) =>
    `Erken faz kontenjani dolmak uzere. Kurulumu bitir, talepleri kacirma: ${url}`,
  (url: string) =>
    `Son hatirlatma: hesabinizi 2 dkda tamamlayin, yoksa bildirim alamazsiniz: ${url}`,
] as const;

export function kurulumHatirlatmaSmsMetni(
  kisaUrl: string,
  basariliGonderim: number
): string {
  const i = kurulumHatirlatmaMesajIndex(basariliGonderim);
  return KURULUM_HATIRLATMA_SMS_METINLERI[i]!(kisaUrl);
}

export function kurulumHatirlatmaTokenGecerliMi(token: string): boolean {
  return new RegExp(
    `^[0-9A-Za-z]{${KURULUM_HATIRLATMA_TOKEN_LEN}}$`
  ).test(token);
}

export function kurulumHatirlatmaTokenUret(): string {
  const bytes = randomBytes(KURULUM_HATIRLATMA_TOKEN_LEN);
  let out = "";
  for (let i = 0; i < KURULUM_HATIRLATMA_TOKEN_LEN; i++) {
    out +=
      KURULUM_HATIRLATMA_TOKEN_ALFABE[
        bytes[i]! % KURULUM_HATIRLATMA_TOKEN_ALFABE.length
      ]!;
  }
  return out;
}

export function kurulumHatirlatmaKisaPath(token: string): string {
  return `/ku/${token}`;
}

export function kurulumHatirlatmaKisaUrl(
  token: string,
  baseUrl?: string
): string {
  return `${smsBaseUrl(baseUrl)}${kurulumHatirlatmaKisaPath(token)}`;
}

export function kurulumHatirlatmaDurdurulduMu(
  ozet: Pick<KurulumHatirlatmaCekiciOzet, "tamamlanmamisBasarili">
): boolean {
  return ozet.tamamlanmamisBasarili >= KURULUM_HATIRLATMA_MAX_GONDERIM;
}

export function kurulumHatirlatmaCooldownAktifMi(
  sonBasariliAt: string | null,
  nowMs = Date.now()
): boolean {
  if (!sonBasariliAt) return false;
  const t = new Date(sonBasariliAt).getTime();
  if (Number.isNaN(t)) return false;
  return nowMs - t < KURULUM_HATIRLATMA_COOLDOWN_MS;
}

export function kurulumHatirlatmaKayitYasYeterliMi(
  kayitTarihi: string,
  nowMs = Date.now()
): boolean {
  const t = new Date(kayitTarihi).getTime();
  if (Number.isNaN(t)) return false;
  return nowMs - t >= KURULUM_HATIRLATMA_MIN_YAS_MS;
}

/**
 * Panel / haftalık toplu: kurulum eksik + yaş + max + (opsiyonel) cooldown.
 */
export function cekiciKurulumHatirlatmaAdayiMi(
  cekici: Cekici,
  ozet: KurulumHatirlatmaCekiciOzet | null,
  opts?: { cooldownUygula?: boolean; nowMs?: number }
): boolean {
  if (!cekici.aktif) return false;
  if (cekici.testerHesap) return false;
  if (cekici.kurulumTamam !== false) return false;
  if (cekiciProfilHazirMi(cekici)) return false;

  const nowMs = opts?.nowMs ?? Date.now();
  if (!kurulumHatirlatmaKayitYasYeterliMi(cekici.kayitTarihi, nowMs)) {
    return false;
  }

  const o: KurulumHatirlatmaCekiciOzet = ozet ?? {
    cekiciId: cekici.id,
    basariliGonderim: 0,
    tamamlanmamisBasarili: 0,
    sonBasariliAt: null,
    tiklayan: false,
    kurulumTamamlandi: false,
  };
  if (o.kurulumTamamlandi) return false;
  if (kurulumHatirlatmaDurdurulduMu(o)) return false;
  if (
    opts?.cooldownUygula !== false &&
    kurulumHatirlatmaCooldownAktifMi(o.sonBasariliAt, nowMs)
  ) {
    return false;
  }
  return true;
}
