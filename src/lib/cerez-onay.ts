export type CerezOnayTercihi = "tumu" | "zorunlu" | null;

/** localStorage anahtarı — gtag early bootstrap ile aynı olmalı */
export const CEREZ_ONAY_STORAGE_KEY = "acil_cerez_onay";
const BANNER_KAPALI_KEY = "acil_cerez_banner_kapali";

export function cerezOnayOku(): CerezOnayTercihi {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CEREZ_ONAY_STORAGE_KEY);
  if (v === "tumu" || v === "zorunlu") return v;
  return null;
}

export function cerezOnayKaydet(tercih: "tumu" | "zorunlu"): void {
  localStorage.setItem(CEREZ_ONAY_STORAGE_KEY, tercih);
  sessionStorage.removeItem(BANNER_KAPALI_KEY);
}

export function cerezBannerKapaliMi(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(BANNER_KAPALI_KEY) === "1";
}

/** Banner’ı kapatır; tercih kaydedilmez, sonraki oturumda tekrar gösterilebilir */
export function cerezBannerKapat(): void {
  sessionStorage.setItem(BANNER_KAPALI_KEY, "1");
}

export function cerezBannerGosterilmeli(): boolean {
  if (cerezOnayOku() != null) return false;
  return !cerezBannerKapaliMi();
}

/** Analitik / isteğe bağlı çerezler yüklenebilir mi */
export function cerezAnalitikAktif(): boolean {
  return cerezOnayOku() === "tumu";
}
