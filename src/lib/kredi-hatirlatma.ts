import { randomBytes } from "crypto";
import {
  cekiciAcikTalepUygunMu,
  cekiciBildirimKrediTutari,
  cekiciYeterliBildirimKredisi,
} from "./ihale";
import { smsBaseUrl } from "./sms-base-url";
import type { Cekici, Talep } from "./types";

export const KREDI_HATIRLATMA_TOKEN_LEN = 8;
export const KREDI_HATIRLATMA_TOKEN_ALFABE =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** Bu tip SMS’ten 3 kez alıp kredi yüklemeyenlere kes */
export const KREDI_HATIRLATMA_MAX_GONDERIM = 3;

/** Otomatik spam önleme */
export const KREDI_HATIRLATMA_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type KrediHatirlatmaKaynak = "otomatik" | "manuel";

export type KrediHatirlatmaCekiciOzet = {
  cekiciId: string;
  basariliGonderim: number;
  yuklenmemisBasarili: number;
  sonBasariliAt: string | null;
  tiklayan: boolean;
  yukledi: boolean;
};

export function krediHatirlatmaTokenGecerliMi(token: string): boolean {
  return new RegExp(
    `^[0-9A-Za-z]{${KREDI_HATIRLATMA_TOKEN_LEN}}$`
  ).test(token);
}

export function krediHatirlatmaTokenUret(): string {
  const bytes = randomBytes(KREDI_HATIRLATMA_TOKEN_LEN);
  let out = "";
  for (let i = 0; i < KREDI_HATIRLATMA_TOKEN_LEN; i++) {
    out +=
      KREDI_HATIRLATMA_TOKEN_ALFABE[
        bytes[i]! % KREDI_HATIRLATMA_TOKEN_ALFABE.length
      ]!;
  }
  return out;
}

export function krediHatirlatmaKisaPath(token: string): string {
  return `/kr/${token}`;
}

export function krediHatirlatmaKisaUrl(
  token: string,
  baseUrl?: string
): string {
  return `${smsBaseUrl(baseUrl)}${krediHatirlatmaKisaPath(token)}`;
}

/** Netgsm-uyumlu ASCII mesaj */
export function krediHatirlatmaSmsMetni(kisaUrl: string): string {
  return (
    "Civarinizda musteriler var fakat krediniz olmadigi icin ihaleye katilamiyorsunuz. " +
    `Musteri kacirmamak icin kredinizi yukleyiniz: ${kisaUrl}`
  );
}

export function krediHatirlatmaDurdurulduMu(
  ozet: Pick<KrediHatirlatmaCekiciOzet, "yuklenmemisBasarili">
): boolean {
  return ozet.yuklenmemisBasarili >= KREDI_HATIRLATMA_MAX_GONDERIM;
}

export function krediHatirlatmaCooldownAktifMi(
  sonBasariliAt: string | null,
  nowMs = Date.now()
): boolean {
  if (!sonBasariliAt) return false;
  const t = new Date(sonBasariliAt).getTime();
  if (Number.isNaN(t)) return false;
  return nowMs - t < KREDI_HATIRLATMA_COOLDOWN_MS;
}

/**
 * Talep için: koşullar uygun, kredi yetersiz.
 * ozetMap: cekiciId → gönderim özeti (yoksa boş kabul).
 */
export function cekiciKrediHatirlatmaAdayiMi(
  talep: Talep,
  cekici: Cekici,
  ozet: KrediHatirlatmaCekiciOzet | null,
  opts?: { cooldownUygula?: boolean; nowMs?: number }
): boolean {
  if (!cekici.aktif) return false;
  if (!cekiciAcikTalepUygunMu(talep, cekici)) return false;
  const tutar = cekiciBildirimKrediTutari(cekici);
  if (cekiciYeterliBildirimKredisi(cekici.kredi, tutar)) return false;

  const o: KrediHatirlatmaCekiciOzet = ozet ?? {
    cekiciId: cekici.id,
    basariliGonderim: 0,
    yuklenmemisBasarili: 0,
    sonBasariliAt: null,
    tiklayan: false,
    yukledi: false,
  };
  if (krediHatirlatmaDurdurulduMu(o)) return false;
  if (
    opts?.cooldownUygula !== false &&
    krediHatirlatmaCooldownAktifMi(o.sonBasariliAt, opts?.nowMs)
  ) {
    return false;
  }
  return true;
}

/** Panel manuel: aktif + kredi yetersiz + 3-kural (cooldown yok) */
export function cekiciKrediHatirlatmaManuelAdayiMi(
  cekici: Cekici,
  ozet: KrediHatirlatmaCekiciOzet | null
): boolean {
  if (!cekici.aktif) return false;
  const tutar = cekiciBildirimKrediTutari(cekici);
  if (cekiciYeterliBildirimKredisi(cekici.kredi, tutar)) return false;
  const o: KrediHatirlatmaCekiciOzet = ozet ?? {
    cekiciId: cekici.id,
    basariliGonderim: 0,
    yuklenmemisBasarili: 0,
    sonBasariliAt: null,
    tiklayan: false,
    yukledi: false,
  };
  return !krediHatirlatmaDurdurulduMu(o);
}
