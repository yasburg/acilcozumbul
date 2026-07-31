import {
  CEREZ_ONAY_STORAGE_KEY,
  cerezAnalitikAktif,
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

/** «Kaydolma işlemi Satis icin» — satış kampanyası hedefi */
export const GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_KAYDOLMA_SATIS_LABEL?.trim() ||
  "AW-18328392362/7LrICKm8w9ccEKql1KNE";

/** «Kredi sepetine ekleme» — paket seçilip ödeme sayfasına gidilince */
export const GOOGLE_ADS_DONUSUM_KREDI_SEPET =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_KREDI_SEPET_LABEL?.trim() ||
  "AW-18328392362/AezgCJW_q9ccEKql1KNE";

/** «Satın alma işlemi» — kredi ödemesi başarıyla tamamlanınca */
export const GOOGLE_ADS_DONUSUM_KREDI_SATIN_ALMA =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_KREDI_SATIN_ALMA_LABEL?.trim() ||
  "AW-18328392362/zm-FCJSzw9ccEKql1KNE";

/** «Sayfa görüntüleme» — müşteri ana sayfa */
export const GOOGLE_ADS_DONUSUM_ANA_SAYFA =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ANA_SAYFA_LABEL?.trim() ||
  "AW-18328392362/MlL8CJCV6dccEKql1KNE";

/** GA sign_up / Ads kaydolma çift tetiklenmesin */
export const GA_SIGN_UP_SESSION_KEY = "acil_ga_sign_up";

/** Aynı ödeme için satın alma dönüşümü bir kez */
export const GA_KREDI_SATIN_ALMA_PREFIX = "acil_ga_kredi_satin_alma:";

/** Aynı talep için fiyat teklifi dönüşümü bir kez */
export const GA_FIYAT_TEKLIFI_PREFIX = "acil_ga_fiyat_teklifi:";

/** Ana sayfa görüntüleme dönüşümü oturumda bir kez */
export const GA_ANA_SAYFA_SESSION_KEY = "acil_ga_ana_sayfa";

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

/** Consent Mode v2 — isteğe bağlı depolama kapalı */
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
 * Head’de en erken çalışan bootstrap (root layout inline `<script>`).
 * Varsayılan: analitik/reklam açık (opt-out). Yalnızca «zorunlu» ise denied.
 * `config` ayrı scriptte, gtag.js yüklendikten sonra.
 */
export function gtagConsentBootstrapInline(): string {
  const key = CEREZ_ONAY_STORAGE_KEY;
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
  wait_for_update: 500
});
gtag('set', 'url_passthrough', true);
gtag('set', 'ads_data_redaction', true);
try {
  var tercih = localStorage.getItem(${JSON.stringify(key)});
  if (tercih === 'zorunlu') {
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
  } else {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
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

const GTAG_HAZIR_EVENT = "acil-gtag-hazir";
const GTAG_HAZIR_FLAG = "__acil_gtag_hazir";

type GtagHazirFn = () => void;
const gtagHazirKuyruk: GtagHazirFn[] = [];

/** gtag.js + AW/GA config yüklendi (idle + lazyOnload sonrası) */
export function gtagHazirMi(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as Window & { [GTAG_HAZIR_FLAG]?: boolean })[GTAG_HAZIR_FLAG]
  );
}

/** GoogleAnalytics Script onLoad — bekleyen conversion’ları çalıştır */
export function gtagHazirIsaretle(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { [GTAG_HAZIR_FLAG]?: boolean };
  if (w[GTAG_HAZIR_FLAG]) return;
  w[GTAG_HAZIR_FLAG] = true;
  const bekleyen = gtagHazirKuyruk.splice(0, gtagHazirKuyruk.length);
  for (const fn of bekleyen) {
    try {
      fn();
    } catch (e) {
      console.error("[gtag] bekleyen olay:", e);
    }
  }
  window.dispatchEvent(new Event(GTAG_HAZIR_EVENT));
}

/**
 * Conversion’ı config’ten önce dataLayer’a basmamak için.
 * gtag.js henüz yoksa kuyruğa alır (OTP hızlı tamamlanınca kaçmasın).
 */
export function gtagHazirOlunca(fn: GtagHazirFn): void {
  if (typeof window === "undefined") return;
  if (gtagHazirMi()) {
    fn();
    return;
  }
  gtagHazirKuyruk.push(fn);
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

  gtagCagir("consent", "update", { ...GTAG_CONSENT_DENIED });
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
 * Müşteri ana sayfa görüntüleme — Google Ads «Sayfa görüntüleme».
 * Oturumda bir kez; çerez onayı «tümü» ve gtag hazır olunca.
 */
export function gtagAdsAnaSayfaGoruntulemeDonusumu(): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_ANA_SAYFA) return;
  if (!cerezAnalitikAktif()) return;
  try {
    if (sessionStorage.getItem(GA_ANA_SAYFA_SESSION_KEY) === "1") return;
  } catch {
    /* private mode */
  }
  gtagHazirOlunca(() => {
    try {
      if (sessionStorage.getItem(GA_ANA_SAYFA_SESSION_KEY) === "1") return;
      sessionStorage.setItem(GA_ANA_SAYFA_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    gtagCagir("event", "conversion", {
      send_to: GOOGLE_ADS_DONUSUM_ANA_SAYFA,
      value: 1.0,
      currency: "TRY",
    });
  });
}

/**
 * Müşteri talep formu başarıyla gönderildiğinde Google Ads dönüşümü.
 * transaction_id: talep id — yenileme / geri dönüşte mükerrer sayımı önler.
 * Enhanced conversions: telefon / ad ile user_data.
 * gtag config hazır olana kadar bekler (lazy yükleme).
 */
export function gtagAdsFiyatTeklifiDonusumu(opts: {
  transactionId: string;
  user?: GtagUserData;
}): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI) return;
  if (!cerezAnalitikAktif()) return;
  const tx = opts.transactionId.trim();
  if (!tx) return;
  const key = `${GA_FIYAT_TEKLIFI_PREFIX}${tx}`;
  try {
    if (sessionStorage.getItem(key) === "1") return;
  } catch {
    /* private mode */
  }
  gtagHazirOlunca(() => {
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    if (opts.user) gtagUserDataAyarla(opts.user);
    gtagCagir("event", "conversion", {
      send_to: GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI,
      value: 1.0,
      currency: "TRY",
      transaction_id: tx,
    });
  });
}

/**
 * Hizmet veren kayıt — Ads «Kaydolma» + «Kaydolma Satis icin» (+ GA sign_up).
 */
function gtagAdsKaydolmaDonusumleriniGonder(user?: GtagUserData): void {
  if (user) gtagUserDataAyarla(user);
  if (GOOGLE_ADS_DONUSUM_KAYDOLMA) {
    gtagCagir("event", "conversion", {
      send_to: GOOGLE_ADS_DONUSUM_KAYDOLMA,
      value: 1.0,
      currency: "TRY",
    });
  }
  if (GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS) {
    gtagCagir("event", "conversion", {
      send_to: GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS,
      value: 1.0,
      currency: "TRY",
    });
  }
  /* Tag Assistant / GA4’te görünür isim */
  gtagCagir("event", "sign_up", { method: "cekici_kayit" });
}

/**
 * Hizmet veren kayıt — Google Ads «Kaydolma işlemi» (+ satış hedefi).
 * Funnel A: form/onay; Funnel B+: phone-first OTP sonrası.
 * gtag config hazır olana kadar bekler (lazy yükleme).
 */
export function gtagAdsKaydolmaDonusumu(user?: GtagUserData): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_KAYDOLMA && !GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS) {
    return;
  }
  if (!cerezAnalitikAktif()) return;
  gtagHazirOlunca(() => gtagAdsKaydolmaDonusumleriniGonder(user));
}

/**
 * Kredi paket seçilip ödeme sayfasına gidilince — «Kredi sepetine ekleme».
 * value: ödenecek tutar (TRY).
 */
export function gtagAdsKrediSepeteEklemeDonusumu(opts?: {
  value?: number;
  user?: GtagUserData;
}): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_KREDI_SEPET) return;
  if (!cerezAnalitikAktif()) return;
  const value =
    typeof opts?.value === "number" && Number.isFinite(opts.value) && opts.value > 0
      ? opts.value
      : 1.0;
  gtagHazirOlunca(() => {
    if (opts?.user) gtagUserDataAyarla(opts.user);
    gtagCagir("event", "conversion", {
      send_to: GOOGLE_ADS_DONUSUM_KREDI_SEPET,
      value,
      currency: "TRY",
    });
  });
}

/**
 * Kredi ödemesi başarılı — Google Ads «Satın alma işlemi».
 * transaction_id ile mükerrer sayımı önler.
 */
export function gtagAdsKrediSatinAlmaDonusumu(opts: {
  transactionId: string;
  value?: number;
  user?: GtagUserData;
}): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_KREDI_SATIN_ALMA) return;
  if (!cerezAnalitikAktif()) return;
  const tx = opts.transactionId.trim();
  if (!tx) return;
  const key = `${GA_KREDI_SATIN_ALMA_PREFIX}${tx}`;
  try {
    if (sessionStorage.getItem(key) === "1") return;
  } catch {
    /* private mode */
  }
  const value =
    typeof opts.value === "number" && Number.isFinite(opts.value) && opts.value > 0
      ? opts.value
      : 1.0;
  gtagHazirOlunca(() => {
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    if (opts.user) gtagUserDataAyarla(opts.user);
    gtagCagir("event", "conversion", {
      send_to: GOOGLE_ADS_DONUSUM_KREDI_SATIN_ALMA,
      value,
      currency: "TRY",
      transaction_id: tx,
    });
  });
}

const GA_KAYDOLMA_USER_KEY = "acil_ga_kaydolma_user";

/**
 * Session ile bir kez — kilidi hemen alır (çift kuyruk / Strict Mode kaçmasın).
 * OTP → kurulum soft navigate sırasında user_data session’da saklanır.
 */
export function gtagAdsKaydolmaDonusumuBirKez(user?: GtagUserData): void {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_DONUSUM_KAYDOLMA && !GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS) {
    return;
  }
  if (!cerezAnalitikAktif()) return;
  try {
    if (sessionStorage.getItem(GA_SIGN_UP_SESSION_KEY) === "1") return;
    /* Gönderimden önce kilitle — ikinci çağrı kuyruğa bile girmez */
    sessionStorage.setItem(GA_SIGN_UP_SESSION_KEY, "1");
    if (user) {
      sessionStorage.setItem(GA_KAYDOLMA_USER_KEY, JSON.stringify(user));
    }
  } catch {
    /* private mode — kilitsiz devam */
  }
  gtagHazirOlunca(() => {
    let u = user;
    if (!u) {
      try {
        const raw = sessionStorage.getItem(GA_KAYDOLMA_USER_KEY);
        if (raw) u = JSON.parse(raw) as GtagUserData;
      } catch {
        /* ignore */
      }
    }
    try {
      sessionStorage.removeItem(GA_KAYDOLMA_USER_KEY);
    } catch {
      /* ignore */
    }
    gtagAdsKaydolmaDonusumleriniGonder(u);
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
  gtagHazirOlunca(() => {
    if (GA_MEASUREMENT_ID) {
      gtagCagir("config", GA_MEASUREMENT_ID, {
        page_path: "/cekici/kayit/onay",
        page_title: "Kayıt Onayı",
      });
    }
    gtagCagir("event", "cekici_kayit_onay", {
      ...(sehir ? { sehir } : {}),
    });
  });
  if (opts?.donusumOlayi === false) return;
  gtagAdsKaydolmaDonusumuBirKez(opts?.user);
}
