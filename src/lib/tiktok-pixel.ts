import {
  cerezAnalitikAktif,
  cerezOnayOku,
  CEREZ_ONAY_STORAGE_KEY,
} from "./cerez-onay";
import { telefonNormalize } from "./telefon";

/** TikTok Pixel kimliği */
export const TIKTOK_PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || "D9IAJJJC77U13TU252RG";

/** Çift tetiklemeyi önlemek için session anahtarları */
export const TT_KAYIT_OL_KEY = "acil_tt_kayit_ol";
export const TT_HESAP_OLUSTUR_KEY = "acil_tt_hesap_olustur";

export function tiktokPixelYapilandirildi(): boolean {
  return Boolean(TIKTOK_PIXEL_ID);
}

type TtqFn = {
  (...args: unknown[]): void;
  page?: (...args: unknown[]) => void;
  track?: (...args: unknown[]) => void;
  identify?: (...args: unknown[]) => void;
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

type TikTokContent = {
  content_id: string;
  content_type: "product" | "product_group";
  content_name: string;
};

type TikTokTrackPayload = {
  contents?: TikTokContent[];
  value?: number;
  currency?: string;
  search_string?: string;
  content_name?: string;
};

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

function analitikHazir(): boolean {
  return (
    typeof window !== "undefined" &&
    tiktokPixelYapilandirildi() &&
    cerezAnalitikAktif()
  );
}

/** TikTok Events Manager event_id (dedup) */
export function tiktokEventId(prefix = "tt"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rnd}`;
}

/** Client-side SHA-256 hex (TikTok identify / PII) */
export async function tiktokSha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** TR cep → E.164 (+90…) TikTok phone_number için */
export function tiktokTelefonE164(tel: string): string | null {
  const n = telefonNormalize(tel);
  if (!/^05[0-9]{9}$/.test(n)) return null;
  return `+90${n.slice(1)}`;
}

function sessionIsaretle(key: string): boolean {
  try {
    if (sessionStorage.getItem(key) === "1") return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

function cookieOku(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function ttclidOku(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const q = new URLSearchParams(window.location.search).get("ttclid");
    if (q?.trim()) return q.trim();
  } catch {
    /* ignore */
  }
  return cookieOku("ttclid");
}

/** Pixel ile aynı event_id → Events API (dedup) */
function eventsApiBridge(opts: {
  event: string;
  eventId: string;
  payload: TikTokTrackPayload;
  phone?: string | null;
  email?: string | null;
  externalId?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const body: Record<string, unknown> = {
    event: opts.event,
    event_id: opts.eventId,
    contents: opts.payload.contents,
    value: opts.payload.value ?? 1,
    currency: opts.payload.currency ?? "TRY",
    url:
      typeof window.location?.href === "string"
        ? window.location.href
        : undefined,
    referrer:
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : undefined,
    ttclid: ttclidOku() || undefined,
    ttp: cookieOku("_ttp") || undefined,
  };
  if (opts.payload.search_string) {
    body.search_string = opts.payload.search_string;
  }
  if (opts.phone) body.phone = opts.phone;
  if (opts.email) body.email = opts.email;
  if (opts.externalId) body.external_id = opts.externalId;

  void fetch("/api/tiktok/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

function trackEvent(
  event: string,
  payload: TikTokTrackPayload,
  opts?: {
    eventId?: string;
    phone?: string | null;
    email?: string | null;
    externalId?: string | null;
    /** Events API köprüsü (varsayılan: açık) */
    server?: boolean;
  }
): string {
  const eventId = opts?.eventId ?? tiktokEventId(event);
  if (!analitikHazir()) return eventId;
  ttqCagir("track", event, payload, { event_id: eventId });
  if (opts?.server !== false) {
    eventsApiBridge({
      event,
      eventId,
      payload,
      phone: opts?.phone,
      email: opts?.email,
      externalId: opts?.externalId,
    });
  }
  return eventId;
}

function icerik(
  id: string,
  name: string,
  type: "product" | "product_group" = "product"
): TikTokContent {
  return { content_id: id, content_type: type, content_name: name };
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
  if (!analitikHazir()) return;
  ttqCagir("page");
}

/**
 * PII postback öncesi identify — değerler client’ta SHA-256.
 * Boş alanlar gönderilmez.
 */
export async function tiktokPixelIdentify(params: {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
}): Promise<void> {
  if (!analitikHazir()) return;

  const payload: Record<string, string> = {};

  const email = params.email?.trim().toLowerCase();
  if (email) {
    payload.email = await tiktokSha256(email);
  }

  if (params.phone) {
    const e164 = tiktokTelefonE164(params.phone);
    if (e164) {
      payload.phone_number = await tiktokSha256(e164);
    }
  }

  const external = params.externalId?.trim();
  if (external) {
    payload.external_id = await tiktokSha256(external);
  }

  if (Object.keys(payload).length === 0) return;
  ttqCagir("identify", payload);
}

/** Landing / hizmet sayfası görüntüleme */
export function tiktokPixelViewContent(params: {
  content_id: string;
  content_name: string;
  content_type?: "product" | "product_group";
  value?: number;
  currency?: string;
  event_id?: string;
}): void {
  trackEvent(
    "ViewContent",
    {
      contents: [
        icerik(
          params.content_id,
          params.content_name,
          params.content_type ?? "product"
        ),
      ],
      value: params.value ?? 1,
      currency: params.currency ?? "TRY",
    },
    { eventId: params.event_id }
  );
}

/** Arama / sorun tipi seçimi */
export function tiktokPixelSearch(params: {
  search_string: string;
  content_id?: string;
  content_name?: string;
  value?: number;
  currency?: string;
  event_id?: string;
}): void {
  const id = params.content_id ?? "search";
  const name = params.content_name ?? params.search_string;
  trackEvent(
    "Search",
    {
      contents: [icerik(id, name)],
      value: params.value ?? 1,
      currency: params.currency ?? "TRY",
      search_string: params.search_string,
    },
    { eventId: params.event_id }
  );
}

/** CTA / düğme tıklaması (consideration) */
export function tiktokPixelClickButton(params: {
  content_id: string;
  content_name: string;
  value?: number;
  currency?: string;
  event_id?: string;
}): void {
  trackEvent(
    "ClickButton",
    {
      contents: [icerik(params.content_id, params.content_name)],
      value: params.value ?? 1,
      currency: params.currency ?? "TRY",
    },
    { eventId: params.event_id }
  );
}

/**
 * Müşteri talep formu tamamlandı → TikTok standart olay «Lead».
 * PII varsa önce identify (SHA-256); Events API ile aynı event_id.
 */
export async function tiktokPixelLead(params?: {
  content_name?: string;
  phone?: string | null;
  externalId?: string | null;
  email?: string | null;
  value?: number;
  currency?: string;
  event_id?: string;
}): Promise<void> {
  if (!analitikHazir()) return;

  await tiktokPixelIdentify({
    email: params?.email,
    phone: params?.phone,
    externalId: params?.externalId,
  });

  const name = params?.content_name ?? "musteri_talep";
  trackEvent(
    "Lead",
    {
      contents: [icerik(name, name)],
      value: params?.value ?? 1,
      currency: params?.currency ?? "TRY",
    },
    {
      eventId: params?.event_id,
      phone: params?.phone,
      email: params?.email,
      externalId: params?.externalId,
    }
  );
}

/**
 * Kayıt ol — CompleteRegistration.
 * Funnel A: final OTP ile hesap birlikte; Funnel B: telefon OTP sonrası.
 */
export async function tiktokPixelKayitOl(params?: {
  content_name?: string;
  phone?: string | null;
  externalId?: string | null;
  email?: string | null;
  value?: number;
  currency?: string;
  once?: boolean;
}): Promise<boolean> {
  if (!analitikHazir()) return false;
  if (params?.once !== false && !sessionIsaretle(TT_KAYIT_OL_KEY)) {
    return false;
  }

  await tiktokPixelIdentify({
    email: params?.email,
    phone: params?.phone,
    externalId: params?.externalId,
  });

  const name = params?.content_name ?? "kayit_ol";
  trackEvent(
    "CompleteRegistration",
    {
      contents: [icerik("kayit_ol", name)],
      value: params?.value ?? 1,
      currency: params?.currency ?? "TRY",
    },
    {
      phone: params?.phone,
      email: params?.email,
      externalId: params?.externalId,
    }
  );
  return true;
}

/**
 * Hesap oluştur — ikinci CompleteRegistration (profil/kurulum tamam).
 * Funnel A: kayıt onayı ile birlikte; Funnel B: /kayit/kurulum bitince.
 */
export async function tiktokPixelHesapOlustur(params?: {
  content_name?: string;
  phone?: string | null;
  externalId?: string | null;
  email?: string | null;
  value?: number;
  currency?: string;
  once?: boolean;
}): Promise<boolean> {
  if (!analitikHazir()) return false;
  if (params?.once !== false && !sessionIsaretle(TT_HESAP_OLUSTUR_KEY)) {
    return false;
  }

  await tiktokPixelIdentify({
    email: params?.email,
    phone: params?.phone,
    externalId: params?.externalId,
  });

  const name = params?.content_name ?? "hesap_olustur";
  trackEvent(
    "CompleteRegistration",
    {
      contents: [icerik("hesap_olustur", name)],
      value: params?.value ?? 1,
      currency: params?.currency ?? "TRY",
    },
    {
      phone: params?.phone,
      email: params?.email,
      externalId: params?.externalId,
    }
  );
  return true;
}

/**
 * Geriye dönük: CompleteRegistration = kayit_ol.
 * @deprecated tiktokPixelKayitOl kullanın
 */
export function tiktokPixelCompleteRegistration(params?: {
  content_name?: string;
}): void {
  void tiktokPixelKayitOl({
    content_name: params?.content_name ?? "cekici_kayit",
    once: true,
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
