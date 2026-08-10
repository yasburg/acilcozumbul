import type { TalepDurumu } from "./types";

/**
 * Panel talep istatistik / liste — bu tarihten önceki kayıtlar test.
 * 28.07.2026 00:00 Türkiye (UTC+3)
 */
export const PANEL_TALEP_MIN_OLUSTURULMA = "2026-07-27T21:00:00.000Z";

export const SEHIR_YOK = "Belirtilmemiş";

export type PanelTalepDurumAdet = { durum: TalepDurumu | string; adet: number };
export type PanelTalepSehirAdet = { sehir: string; adet: number };

export type PanelTalepOzet = {
  total: number;
  durumAdetleri: PanelTalepDurumAdet[];
  sehirAdetleri: PanelTalepSehirAdet[];
  sehirSayisi: number;
  teklifsiz: number;
  ihalede: number;
  anlasildi: number;
};

export type PanelTalepHaritaNokta = {
  id: string;
  lat: number;
  lng: number;
  sehir: string;
  ilce: string | null;
  durum: string;
  olusturulma: string;
};

export function talepSehirEtiketi(
  konumIl: string | null | undefined
): string {
  const s = (konumIl ?? "").trim();
  return s || SEHIR_YOK;
}

export function panelTalepDurumEtiketi(durum: string): string {
  switch (durum) {
    case "ihalede":
      return "İhalede";
    case "yeniden_ihalede":
      return "Yeniden ihale";
    case "kazanan_belli":
      return "Kazanan belli";
    case "anlaşıldı":
      return "Anlaşıldı";
    case "iptal":
      return "İptal";
    default:
      return durum;
  }
}

/** Oluşturma → iptal arası süre metni (kart üzerinde). */
export function panelTalepIptalSureEtiketi(
  olusturulma: string,
  iptalAt: string | null | undefined
): string | null {
  if (!iptalAt) return null;
  const bas = Date.parse(olusturulma);
  const bit = Date.parse(iptalAt);
  if (!Number.isFinite(bas) || !Number.isFinite(bit) || bit < bas) return null;
  const sn = Math.max(0, Math.round((bit - bas) / 1000));
  if (sn < 60) {
    return `${sn} saniye sonra iptal edildi`;
  }
  const dk = Math.floor(sn / 60);
  if (dk < 60) {
    const kalanSn = sn % 60;
    if (dk < 5 && kalanSn > 0) {
      return `${dk} dk ${kalanSn} sn sonra iptal edildi`;
    }
    return `${dk} dakika sonra iptal edildi`;
  }
  const saat = Math.floor(dk / 60);
  const kalanDk = dk % 60;
  if (kalanDk === 0) {
    return `${saat} saat sonra iptal edildi`;
  }
  return `${saat} saat ${kalanDk} dk sonra iptal edildi`;
}
