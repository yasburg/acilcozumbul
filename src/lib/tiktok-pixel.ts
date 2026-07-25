import {
  cerezAnalitikAktif,
  cerezOnayOku,
  CEREZ_ONAY_STORAGE_KEY,
} from "./cerez-onay";

/** TikTok Pixel kimliği */
export const TIKTOK_PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || "D9IAJJJC77U13TU252RG";

export function tiktokPixelYapilandirildi(): boolean {
  return Boolean(TIKTOK_PIXEL_ID);
}

type TtqFn = {
  (...args: unknown[]): void;
  page?: (...args: unknown[]) => void;
  track?: (...args: unknown[]) => void;
  holdConsent?: () => void;
  grantConsent?: () => void;
  revokeConsent?: () => void;
  load?: (id: string, opts?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    ttq?: TtqFn;
    TiktokAnalyticsObject?: string;
  }
}

function ttqCagir(method: string, ...args: unknown[]): void {
  if (typeof window === "undefined") return;
  const ttq = window.ttq;
  if (!ttq) return;
  const fn = (ttq as unknown as Record<string, unknown>)[method];
  if (typeof fn === "function") {
    (fn as (...a: unknown[]) => void).apply(ttq, args);
    return;
  }
  if (typeof ttq === "function") {
    ttq(method, ...args);
  }
}

/** Çerez tercihine göre TikTok consent */
export function tiktokPixelCerezSenkronize(): void {
  if (typeof window === "undefined" || !tiktokPixelYapilandirildi()) return;

  if (cerezAnalitikAktif()) {
    ttqCagir("grantConsent");
    return;
  }

  if (cerezOnayOku() === "zorunlu") {
    ttqCagir("revokeConsent");
  }
}

/** Analitik onayı varken PageView */
export function tiktokPixelPageView(): void {
  if (typeof window === "undefined") return;
  if (!tiktokPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  ttqCagir("page");
}

/**
 * Müşteri talep formu tamamlandı → TikTok «SubmitForm».
 */
export function tiktokPixelLead(params?: {
  content_name?: string;
}): void {
  if (typeof window === "undefined") return;
  if (!tiktokPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  ttqCagir("track", "SubmitForm", {
    content_name: params?.content_name ?? "musteri_talep",
  });
}

/**
 * Hizmet veren kayıt onayı → TikTok «CompleteRegistration».
 */
export function tiktokPixelCompleteRegistration(params?: {
  content_name?: string;
}): void {
  if (typeof window === "undefined") return;
  if (!tiktokPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  ttqCagir("track", "CompleteRegistration", {
    content_name: params?.content_name ?? "cekici_kayit",
  });
}

/**
 * Script bootstrap: queue + holdConsent + load; «tumu» ise grant + page.
 */
export function tiktokPixelBootstrapInline(pixelId: string): string {
  return `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.holdConsent();
  ttq.load('${pixelId}');
  try{
    if(localStorage.getItem('${CEREZ_ONAY_STORAGE_KEY}')==='tumu'){
      ttq.grantConsent();
      ttq.page();
    }
  }catch(e){}
}(window, document, 'ttq');
`.trim();
}
