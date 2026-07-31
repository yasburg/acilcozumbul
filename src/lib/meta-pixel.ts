import { cerezAnalitikAktif } from "./cerez-onay";

/** Meta (Facebook) Pixel kimliği */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1552497653179792";

export function metaPixelYapilandirildi(): boolean {
  return Boolean(META_PIXEL_ID);
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

function fbqCagir(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/** Çerez tercihine göre Meta Pixel consent (grant / revoke) */
export function metaPixelCerezSenkronize(): void {
  if (typeof window === "undefined" || !metaPixelYapilandirildi()) return;

  if (cerezAnalitikAktif()) {
    fbqCagir("consent", "grant");
    return;
  }

  fbqCagir("consent", "revoke");
}

/** Analitik onayı varken PageView */
export function metaPixelPageView(): void {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  fbqCagir("track", "PageView");
}

/**
 * Müşteri talep formu tamamlandı → Meta standart olay «Lead».
 */
export function metaPixelLead(params?: {
  content_name?: string;
  value?: number;
  currency?: string;
}): void {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  fbqCagir("track", "Lead", {
    content_name: params?.content_name ?? "musteri_talep",
    value: params?.value ?? 1.0,
    currency: params?.currency ?? "TRY",
  });
}

/**
 * Hizmet veren kayıt onayı → Meta standart olay «CompleteRegistration».
 */
export function metaPixelCompleteRegistration(params?: {
  content_name?: string;
  status?: boolean;
}): void {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  fbqCagir("track", "CompleteRegistration", {
    content_name: params?.content_name ?? "cekici_kayit",
    status: params?.status ?? true,
  });
}

/**
 * Head / Script için bootstrap: queue + init.
 * Varsayılan grant; yalnızca «zorunlu» ise revoke kalır.
 */
export function metaPixelBootstrapInline(pixelId: string): string {
  return `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
try{
  if(localStorage.getItem('acil_cerez_onay')==='zorunlu'){
    fbq('consent','revoke');
  } else {
    fbq('consent','grant');
    fbq('track','PageView');
  }
}catch(e){}
`.trim();
}
