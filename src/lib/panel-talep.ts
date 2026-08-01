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
