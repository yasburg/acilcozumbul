import {
  CEREZ_ONAY_STORAGE_KEY,
  cerezAnalitikAktif,
  cerezOnayOku,
} from "./cerez-onay";

/** Google Analytics 4 ölçüm kimliği */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-RX7B85YF1D";

/** Google Ads hesap kimliği (dönüşüm etiketi) */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18328392362";

/** «Fiyat teklifi isteyin ACB» — müşteri talep formu tamamlanınca */
export const GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() ||
  "AW-18328392362/Msc0CNjLnNMcEKql1KNE";

export function gtagYapilandirildi(): boolean {
  return Boolean(GA_MEASUREMENT_ID || GOOGLE_ADS_ID);
}

export type GtagConsentState = "granted" | "denied";

export type GtagConsentParams = {
  ad_storage: GtagConsentState;
  ad_user_data: GtagConsentState;
  ad_personalization: GtagConsentState;
  analytics_storage: GtagConsentState;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Consent Mode v2 — tüm parametreler denied (EEA / KVKK varsayılanı) */
export const GTAG_CONSENT_DENIED: GtagConsentParams = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

/** Tüm isteğe bağlı ölçüm / reklam çerezleri açık */
export const GTAG_CONSENT_GRANTED: GtagConsentParams = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

/**
 * Head’de `beforeInteractive` ile en erken çalışan bootstrap.
 * Sıra (Google advanced consent mode): dataLayer → consent default →
 * url_passthrough / ads_data_redaction → kayıtlı tercih update.
 * `config` ayrı scriptte, gtag.js yüklendikten sonra.
 */
export function gtagConsentBootstrapInline(): string {
  const key = CEREZ_ONAY_STORAGE_KEY;
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'url_passthrough', true);
gtag('set', 'ads_data_redaction', true);
try {
  var tercih = localStorage.getItem(${JSON.stringify(key)});
  if (tercih === 'tumu') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  } else if (tercih === 'zorunlu') {
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
  }
} catch (e) {}
`.trim();
}

function gtagCagir(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag(...args);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/** Çerez tercihine göre Consent Mode update (sayfa geçişinden önce çağır) */
export function gtagCerezSenkronize(): void {
  if (typeof window === "undefined" || !gtagYapilandirildi()) return;

  if (cerezAnalitikAktif()) {
    gtagCagir("consent", "update", { ...GTAG_CONSENT_GRANTED });
    return;
  }

  if (cerezOnayOku() === "zorunlu") {
    gtagCagir("consent", "update", { ...GTAG_CONSENT_DENIED });
  }
}

/** Dönüşüm / özel etkinlik (analitik onayı varken) */
export function gtagOlay(
  olay: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !gtagYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  gtagCagir("event", olay, params ?? {});
}

/**
 * Müşteri talep formu başarıyla gönderildiğinde Google Ads dönüşümü.
 * Google Ads «Fiyat teklifi isteyin ACB» (sayfa yükleme yerine SPA olay).
 */
export function gtagAdsFiyatTeklifiDonusumu(): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI) return;
  if (!cerezAnalitikAktif()) return;
  gtagCagir("event", "conversion", {
    send_to: GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI,
    value: 1.0,
    currency: "TRY",
  });
}
