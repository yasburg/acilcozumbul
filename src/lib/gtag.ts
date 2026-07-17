import { cerezAnalitikAktif, cerezOnayOku } from "./cerez-onay";

/** Google Analytics 4 ölçüm kimliği */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-RX7B85YF1D";

export function gtagYapilandirildi(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Çerez tercihine göre GA consent mode güncelle */
export function gtagCerezSenkronize(): void {
  if (typeof window === "undefined" || !gtagYapilandirildi()) return;
  if (typeof window.gtag !== "function") return;

  if (cerezAnalitikAktif()) {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    return;
  }

  if (cerezOnayOku() === "zorunlu") {
    window.gtag("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  }
}
