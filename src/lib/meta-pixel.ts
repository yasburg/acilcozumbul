import { cerezAnalitikAktif } from "./cerez-onay";
import { telefonNormalize } from "./telefon";

/** Meta (Facebook) Pixel kimliği */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1552497653179792";

/** Onay sayfası yedek CompleteRegistration için */
export const META_KAYIT_USER_KEY = "acil_meta_kayit_user";

export function metaPixelYapilandirildi(): boolean {
  return Boolean(META_PIXEL_ID);
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export type MetaUserData = {
  phone?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
};

function fbqCagir(...args: unknown[]): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/** SHA-256 hex (Meta Manual Advanced Matching) */
export async function metaSha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Meta telefon normalizasyonu: ülke kodu + rakamlar, `+` yok.
 * Örn. 05321234567 → 905321234567
 */
export function metaTelefonNormalize(tel: string): string | null {
  const n = telefonNormalize(tel);
  if (!/^05[0-9]{9}$/.test(n)) return null;
  return `90${n.slice(1)}`;
}

function metaIsimNormalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hash’li Advanced Matching parametreleri */
export async function metaAdvancedMatchingHazirla(
  user?: MetaUserData | null
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (!user) return out;

  if (user.phone) {
    const ph = metaTelefonNormalize(user.phone);
    if (ph) out.ph = await metaSha256(ph);
  }
  if (user.email) {
    const em = user.email.trim().toLowerCase();
    if (em) out.em = await metaSha256(em);
  }
  const fn = user.firstName ? metaIsimNormalize(user.firstName) : "";
  if (fn) out.fn = await metaSha256(fn);
  const ln = user.lastName ? metaIsimNormalize(user.lastName) : "";
  if (ln) out.ln = await metaSha256(ln);
  if (user.externalId?.trim()) {
    out.external_id = await metaSha256(user.externalId.trim());
  }
  if (Object.keys(out).length > 0) {
    out.country = await metaSha256("tr");
  }
  return out;
}

/** init’e Advanced Matching yaz (aynı pixel ID ile tekrar çağrılabilir) */
export async function metaUserDataAyarla(
  user?: MetaUserData | null
): Promise<void> {
  if (typeof window === "undefined" || !metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  const matching = await metaAdvancedMatchingHazirla(user);
  if (Object.keys(matching).length === 0) return;
  fbqCagir("init", META_PIXEL_ID, matching);
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
export async function metaPixelLead(params?: {
  content_name?: string;
  value?: number;
  currency?: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  await metaUserDataAyarla({
    phone: params?.phone,
    firstName: params?.firstName,
    lastName: params?.lastName,
    externalId: params?.externalId,
  });
  fbqCagir("track", "Lead", {
    content_name: params?.content_name ?? "musteri_talep",
    value: params?.value ?? 1.0,
    currency: params?.currency ?? "TRY",
  });
}

/**
 * Hizmet veren kayıt → Meta standart olay «CompleteRegistration».
 * Advanced Matching: ph / fn / ln / external_id (SHA-256).
 */
export async function metaPixelCompleteRegistration(params?: {
  content_name?: string;
  status?: boolean;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  await metaUserDataAyarla({
    phone: params?.phone,
    firstName: params?.firstName,
    lastName: params?.lastName,
    externalId: params?.externalId,
  });
  fbqCagir("track", "CompleteRegistration", {
    content_name: params?.content_name ?? "cekici_kayit",
    status: params?.status ?? true,
  });
}

/** Onay sayfası yedek tetik için kullanıcı verisini sakla */
export function metaKayitUserSakla(user: MetaUserData): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(META_KAYIT_USER_KEY, JSON.stringify(user));
  } catch {
    /* private mode */
  }
}

export function metaKayitUserOku(): MetaUserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(META_KAYIT_USER_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as MetaUserData;
    return j && typeof j === "object" ? j : null;
  } catch {
    return null;
  }
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
