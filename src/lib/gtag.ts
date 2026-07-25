import {
  CEREZ_ONAY_STORAGE_KEY,
  cerezAnalitikAktif,
  cerezOnayOku,
} from "./cerez-onay";
import { telefonNormalize } from "./telefon";

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

/** «Kaydolma işlemi» — hizmet veren kayıt */
export const GOOGLE_ADS_DONUSUM_KAYDOLMA =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_KAYDOLMA_LABEL?.trim() ||
  "AW-18328392362/Y9juCP_Rm9McEKql1KNE";

/** GA sign_up / Ads kaydolma çift tetiklenmesin */
export const GA_SIGN_UP_SESSION_KEY = "acil_ga_sign_up";

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

export type GtagUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
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

/** TR cep → E.164 (+90…) — gelişmiş dönüşümler için */
export function gtagTelefonE164(tel: string): string | null {
  const n = telefonNormalize(tel);
  if (!/^05[0-9]{9}$/.test(n)) return null;
  return `+90${n.slice(1)}`;
}

/**
 * Enhanced conversions (in-page) — Google hash’ler; ham PII gönderilir.
 * https://support.google.com/google-ads/answer/13258081
 */
export function gtagUserDataAyarla(data: GtagUserData): void {
  if (typeof window === "undefined") return;
  if (!cerezAnalitikAktif()) return;

  const userData: Record<string, unknown> = {};
  const email = data.email?.trim().toLowerCase();
  if (email && email.includes("@")) userData.email = email;

  if (data.phone) {
    const e164 = gtagTelefonE164(data.phone);
    if (e164) userData.phone_number = e164;
  }

  const first = data.firstName?.trim();
  const last = data.lastName?.trim();
  if (first || last) {
    userData.address = {
      ...(first ? { first_name: first } : {}),
      ...(last ? { last_name: last } : {}),
      country: "TR",
    };
  }

  if (Object.keys(userData).length === 0) return;
  gtagCagir("set", "user_data", userData);
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
 * Enhanced conversions: telefon / ad ile user_data.
 */
export function gtagAdsFiyatTeklifiDonusumu(user?: GtagUserData): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI) return;
  if (!cerezAnalitikAktif()) return;
  if (user) gtagUserDataAyarla(user);
  gtagCagir("event", "conversion", {
    send_to: GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI,
    value: 1.0,
    currency: "TRY",
  });
}

/**
 * Hizmet veren kayıt — Google Ads «Kaydolma işlemi».
 * Funnel A: /cekici/kayit/onay; Funnel B+: phone-first OTP sonrası.
 */
export function gtagAdsKaydolmaDonusumu(user?: GtagUserData): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_KAYDOLMA) return;
  if (!cerezAnalitikAktif()) return;
  if (user) gtagUserDataAyarla(user);
  gtagCagir("event", "conversion", {
    send_to: GOOGLE_ADS_DONUSUM_KAYDOLMA,
    value: 1.0,
    currency: "TRY",
  });
}

/**
 * Hizmet veren kayıt onayı — tam sayfa yüklemesinde GA page_view + Ads conversion.
 */
export function gtagCekiciKayitOnayGoruntule(
  sehir?: string,
  opts?: { donusumOlayi?: boolean; user?: GtagUserData }
): void {
  if (typeof window === "undefined") return;
  if (!cerezAnalitikAktif()) return;
  if (GA_MEASUREMENT_ID) {
    gtagCagir("config", GA_MEASUREMENT_ID, {
      page_path: "/cekici/kayit/onay",
      page_title: "Kayıt Onayı",
    });
  }
  if (opts?.donusumOlayi === false) return;
  gtagAdsKaydolmaDonusumu(opts?.user);
  gtagCagir("event", "sign_up", {
    method: "cekici_kayit",
    ...(sehir ? { sehir } : {}),
  });
  gtagCagir("event", "cekici_kayit_onay", {
    ...(sehir ? { sehir } : {}),
  });
}
