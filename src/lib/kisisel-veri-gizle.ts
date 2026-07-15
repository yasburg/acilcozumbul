/** Panel ekranında ad / soyad / telefon gizleme (ekran paylaşımı, video vb.) */
export const KISISEL_VERI_GIZLE_KEY = "acil_kisisel_veri_gizli";
export const KISISEL_VERI_GIZLE_EVENT = "acil-kisisel-veri-gizle";

export function kisiselVeriGizliMi(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KISISEL_VERI_GIZLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setKisiselVeriGizli(gizli: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KISISEL_VERI_GIZLE_KEY, gizli ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(KISISEL_VERI_GIZLE_EVENT));
}

export function adGoster(ad: string | undefined | null, gizli: boolean): string {
  if (!ad) return gizli ? "••••" : "";
  return gizli ? "••••" : ad;
}

export function soyadGoster(
  soyad: string | undefined | null,
  gizli: boolean
): string {
  if (!soyad) return gizli ? "•" : "";
  return gizli ? "•" : soyad;
}

/** Tamamen gizli — kısmi maske değil */
export function telefonGoster(
  telefon: string | undefined | null,
  gizli: boolean
): string {
  if (!telefon) return "";
  return gizli ? "•••• ••• •• ••" : telefon;
}
