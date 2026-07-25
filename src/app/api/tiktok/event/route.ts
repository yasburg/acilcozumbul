import { NextRequest, NextResponse } from "next/server";
import { istekIp } from "@/lib/request-ip";
import {
  tiktokEventsApiGonder,
  tiktokEventsApiYapilandirildi,
  type TikTokServerEventName,
} from "@/lib/tiktok-events-api";

const IZINLI_OLAYLAR = new Set<TikTokServerEventName>([
  "ViewContent",
  "CompleteRegistration",
  "Lead",
  "Search",
  "ClickButton",
  "SubmitForm",
]);

/**
 * Tarayıcı pixel ile aynı event_id — Events API dedup.
 * Body: event, event_id, contents, value, currency, phone, email, external_id, url, ttclid, ttp
 */
export async function POST(request: NextRequest) {
  if (!tiktokEventsApiYapilandirildi()) {
    return NextResponse.json(
      { error: "TikTok Events API yapılandırılmadı." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Geçersiz gövde." }, { status: 400 });
  }

  const event = String((body as { event?: string }).event ?? "");
  if (!IZINLI_OLAYLAR.has(event as TikTokServerEventName)) {
    return NextResponse.json({ error: "Geçersiz olay." }, { status: 400 });
  }

  const eventId = String((body as { event_id?: string }).event_id ?? "").trim();
  if (!eventId || eventId.length > 128) {
    return NextResponse.json({ error: "event_id gerekli." }, { status: 400 });
  }

  const contentsRaw = (body as { contents?: unknown }).contents;
  const contents = Array.isArray(contentsRaw)
    ? contentsRaw
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c) => ({
          content_id: String(c.content_id ?? "unknown"),
          content_type:
            c.content_type === "product_group"
              ? ("product_group" as const)
              : ("product" as const),
          content_name:
            typeof c.content_name === "string" ? c.content_name : undefined,
        }))
    : undefined;

  const sonuc = await tiktokEventsApiGonder({
    event: event as TikTokServerEventName,
    eventId,
    url:
      typeof (body as { url?: string }).url === "string"
        ? (body as { url: string }).url
        : request.headers.get("referer"),
    referrer:
      typeof (body as { referrer?: string }).referrer === "string"
        ? (body as { referrer: string }).referrer
        : null,
    value:
      typeof (body as { value?: number }).value === "number"
        ? (body as { value: number }).value
        : 1,
    currency:
      typeof (body as { currency?: string }).currency === "string"
        ? (body as { currency: string }).currency
        : "TRY",
    contents,
    searchString:
      typeof (body as { search_string?: string }).search_string === "string"
        ? (body as { search_string: string }).search_string
        : null,
    email:
      typeof (body as { email?: string }).email === "string"
        ? (body as { email: string }).email
        : null,
    phone:
      typeof (body as { phone?: string }).phone === "string"
        ? (body as { phone: string }).phone
        : null,
    externalId:
      typeof (body as { external_id?: string }).external_id === "string"
        ? (body as { external_id: string }).external_id
        : null,
    ip: istekIp(request),
    userAgent: request.headers.get("user-agent"),
    ttclid:
      typeof (body as { ttclid?: string }).ttclid === "string"
        ? (body as { ttclid: string }).ttclid
        : null,
    ttp:
      typeof (body as { ttp?: string }).ttp === "string"
        ? (body as { ttp: string }).ttp
        : null,
  });

  if (!sonuc.ok) {
    return NextResponse.json(
      { error: sonuc.error, code: sonuc.code },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
