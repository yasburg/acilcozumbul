import { createHash } from "crypto";
import { telefonNormalize } from "./telefon";

/** Pixel ID — client NEXT_PUBLIC ile aynı varsayılan */
export const TIKTOK_EVENTS_PIXEL_ID =
  process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID?.trim() || "D9IAJJJC77U13TU252RG";

/** Sunucu Events API access token — asla NEXT_PUBLIC_ yapmayın */
export const TIKTOK_EVENTS_API_ACCESS_TOKEN =
  process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN?.trim() || "";

const TIKTOK_EVENT_TRACK_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

export type TikTokServerEventName =
  | "ViewContent"
  | "CompleteRegistration"
  | "Lead"
  | "Search"
  | "ClickButton"
  | "SubmitForm";

export type TikTokServerContent = {
  content_id: string;
  content_type?: "product" | "product_group";
  content_name?: string;
};

export type TikTokServerEventInput = {
  event: TikTokServerEventName;
  eventId: string;
  /** Unix saniye; yoksa şimdi */
  eventTime?: number;
  url?: string | null;
  referrer?: string | null;
  value?: number;
  currency?: string;
  contents?: TikTokServerContent[];
  searchString?: string | null;
  /** Ham PII — sunucuda SHA-256 */
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  /** TikTok click id / cookie */
  ttclid?: string | null;
  ttp?: string | null;
};

export function tiktokEventsApiYapilandirildi(): boolean {
  return Boolean(TIKTOK_EVENTS_API_ACCESS_TOKEN && TIKTOK_EVENTS_PIXEL_ID);
}

export function tiktokSha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** TR cep → E.164 sonra SHA-256 */
export function tiktokPhoneHash(tel: string): string | null {
  let d = telefonNormalize(tel);
  if (!/^05[0-9]{9}$/.test(d)) return null;
  const e164 = `+90${d.slice(1)}`;
  return tiktokSha256Hex(e164);
}

function kullaniciAlani(input: TikTokServerEventInput): Record<string, string> {
  const user: Record<string, string> = {};

  const email = input.email?.trim().toLowerCase();
  if (email) user.email = tiktokSha256Hex(email);

  if (input.phone) {
    const phone = tiktokPhoneHash(input.phone);
    if (phone) user.phone = phone;
  }

  const external = input.externalId?.trim();
  if (external) user.external_id = tiktokSha256Hex(external);

  if (input.ip?.trim()) user.ip = input.ip.trim();
  if (input.userAgent?.trim()) user.user_agent = input.userAgent.trim();
  if (input.ttclid?.trim()) user.ttclid = input.ttclid.trim();
  if (input.ttp?.trim()) user.ttp = input.ttp.trim();

  return user;
}

/** Events 2.0 track gövdesi (test / debug için export) */
export function tiktokEventsApiPayload(input: TikTokServerEventInput): {
  event_source: "web";
  event_source_id: string;
  data: Record<string, unknown>[];
} {
  const properties: Record<string, unknown> = {
    currency: input.currency ?? "TRY",
    value: input.value ?? 1,
  };
  if (input.contents?.length) {
    properties.contents = input.contents.map((c) => ({
      content_id: c.content_id,
      content_type: c.content_type ?? "product",
      ...(c.content_name ? { content_name: c.content_name } : {}),
    }));
  }
  if (input.searchString?.trim()) {
    properties.query = input.searchString.trim();
  }

  const user = kullaniciAlani(input);
  const page: Record<string, string> = {};
  if (input.url?.trim()) page.url = input.url.trim();
  if (input.referrer?.trim()) page.referrer = input.referrer.trim();

  return {
    event_source: "web",
    event_source_id: TIKTOK_EVENTS_PIXEL_ID,
    data: [
      {
        event: input.event,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        user,
        ...(Object.keys(page).length ? { page } : {}),
        properties,
      },
    ],
  };
}

export type TikTokEventsApiSonuc =
  | { ok: true; code: number; message?: string }
  | { ok: false; error: string; code?: number; detail?: unknown };

/**
 * TikTok Events API (web) — ViewContent / CompleteRegistration / Lead vb.
 * Access-Token header ile POST /open_api/v1.3/event/track/
 */
export async function tiktokEventsApiGonder(
  input: TikTokServerEventInput
): Promise<TikTokEventsApiSonuc> {
  if (!tiktokEventsApiYapilandirildi()) {
    return { ok: false, error: "TikTok Events API yapılandırılmadı." };
  }

  const body = tiktokEventsApiPayload(input);

  try {
    const res = await fetch(TIKTOK_EVENT_TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": TIKTOK_EVENTS_API_ACCESS_TOKEN,
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      code?: number;
      message?: string;
      data?: unknown;
    };
    const code = typeof json.code === "number" ? json.code : res.status;
    if (!res.ok || code !== 0) {
      console.error("[tiktok-events-api]", code, json.message, json);
      return {
        ok: false,
        error: json.message || `HTTP ${res.status}`,
        code,
        detail: json,
      };
    }
    return { ok: true, code, message: json.message };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "İstek başarısız";
    console.error("[tiktok-events-api]", msg);
    return { ok: false, error: msg };
  }
}
