import { cerezAnalitikAktif } from "./cerez-onay";
import { telefonNormalize } from "./telefon";

/** Meta (Facebook) Pixel kimliği */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1552497653179792";

/**
 * Oturum boyunca Advanced Matching (PageView / Lead / kayıt).
 * Eski anahtar ile uyumlu tutulur.
 */
export const META_USER_DATA_KEY = "acil_meta_user";
/** @deprecated META_USER_DATA_KEY kullanın */
export const META_KAYIT_USER_KEY = META_USER_DATA_KEY;

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

function metaUserAlanBirlesik(
  prev: MetaUserData,
  next: MetaUserData
): MetaUserData {
  const out: MetaUserData = { ...prev };
  for (const key of [
    "phone",
    "email",
    "firstName",
    "lastName",
    "externalId",
  ] as const) {
    const v = next[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim();
  }
  return out;
}

/** PageView ve dönüşümler için kullanıcı bilgisini oturumda tut */
export function metaUserDataSakla(user: MetaUserData): void {
  if (typeof window === "undefined") return;
  try {
    const onceki = metaUserDataOku() ?? {};
    const birlesik = metaUserAlanBirlesik(onceki, user);
    sessionStorage.setItem(META_USER_DATA_KEY, JSON.stringify(birlesik));
  } catch {
    /* private mode */
  }
}

export function metaUserDataOku(): MetaUserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(META_USER_DATA_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as MetaUserData;
    return j && typeof j === "object" ? j : null;
  } catch {
    return null;
  }
}

/** @deprecated metaUserDataSakla */
export const metaKayitUserSakla = metaUserDataSakla;
/** @deprecated metaUserDataOku */
export const metaKayitUserOku = metaUserDataOku;

/** Çerez tercihine göre Meta Pixel consent (grant / revoke) */
export function metaPixelCerezSenkronize(): void {
  if (typeof window === "undefined" || !metaPixelYapilandirildi()) return;

  if (cerezAnalitikAktif()) {
    fbqCagir("consent", "grant");
    return;
  }

  fbqCagir("consent", "revoke");
}

/**
 * Analitik onayı varken PageView.
 * Saklı telefon/e-posta varsa Advanced Matching ile gönderilir.
 */
export async function metaPixelPageView(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  await metaUserDataAyarla(metaUserDataOku());
  fbqCagir("track", "PageView");
}

/**
 * Girişli çekici bilgisini oturuma yazar (PageView AM için).
 * /api/cekici/me — yalnızca çekici paneli yollarında çağırın.
 */
export async function metaCekiciOturumZenginlestir(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!cerezAnalitikAktif()) return;
  try {
    const res = await fetch("/api/cekici/me", { credentials: "include" });
    if (!res.ok) return;
    const me = (await res.json()) as {
      id?: string;
      ad?: string;
      telefon?: string;
      faturaEposta?: string | null;
      faturaEpostaDogrulandi?: boolean;
    };
    const adParca = String(me.ad ?? "")
      .trim()
      .split(/\s+/);
    const firstName = adParca[0] || undefined;
    const lastName =
      adParca.length > 1 ? adParca.slice(1).join(" ") : undefined;
    metaUserDataSakla({
      phone: me.telefon,
      email:
        me.faturaEpostaDogrulandi && me.faturaEposta
          ? me.faturaEposta
          : undefined,
      firstName,
      lastName,
      externalId: me.id,
    });
  } catch {
    /* oturum yok / ağ */
  }
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
  email?: string | null;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  const user: MetaUserData = {
    phone: params?.phone,
    email: params?.email,
    firstName: params?.firstName,
    lastName: params?.lastName,
    externalId: params?.externalId,
  };
  metaUserDataSakla(user);
  await metaUserDataAyarla(user);
  fbqCagir("track", "Lead", {
    content_name: params?.content_name ?? "musteri_talep",
    value: params?.value ?? 1.0,
    currency: params?.currency ?? "TRY",
  });
}

/**
 * Hizmet veren kayıt → Meta standart olay «CompleteRegistration».
 * Advanced Matching: ph / fn / ln / external_id (SHA-256).
 * value + currency: Meta tanısı / ROAS için zorunlu (ücretsiz kayıt → sembolik 1 TRY).
 */
export async function metaPixelCompleteRegistration(params?: {
  content_name?: string;
  status?: boolean;
  value?: number;
  currency?: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  externalId?: string | null;
  email?: string | null;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (!metaPixelYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;
  const user: MetaUserData = {
    phone: params?.phone,
    email: params?.email,
    firstName: params?.firstName,
    lastName: params?.lastName,
    externalId: params?.externalId,
  };
  metaUserDataSakla(user);
  await metaUserDataAyarla(user);
  fbqCagir("track", "CompleteRegistration", {
    content_name: params?.content_name ?? "cekici_kayit",
    status: params?.status ?? true,
    value: params?.value ?? 1.0,
    currency: params?.currency ?? "TRY",
  });
}

/**
 * Head / Script için bootstrap: queue + init.
 * PageView React tarafında (AM ile) atılır — çift sayım olmasın.
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
  }
}catch(e){}
`.trim();
}
