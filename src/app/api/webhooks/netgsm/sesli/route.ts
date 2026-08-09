import { NextRequest, NextResponse } from "next/server";
import {
  sesliWebhookDtmfIsle,
  sesliWebhookSecretGecerliMi,
  type NetgsmSesliWebhookPayload,
} from "@/lib/netgsm-sesli-webhook";

export const dynamic = "force-dynamic";

async function bodyOku(
  request: NextRequest
): Promise<NetgsmSesliWebhookPayload> {
  const ctype = request.headers.get("content-type") ?? "";
  if (ctype.includes("application/json")) {
    const j = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    return j as NetgsmSesliWebhookPayload;
  }
  if (
    ctype.includes("application/x-www-form-urlencoded") ||
    ctype.includes("multipart/form-data")
  ) {
    const fd = await request.formData().catch(() => null);
    if (!fd) return {};
    const get = (k: string) => {
      const v = fd.get(k);
      return v == null ? null : String(v);
    };
    const push = get("push_button") ?? get("detail.push_button");
    return {
      relationid: get("relationid"),
      callee: get("callee"),
      push_button: push,
    };
  }
  /* Netgsm bazen content-type olmadan JSON POST eder */
  const text = await request.text().catch(() => "");
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as NetgsmSesliWebhookPayload;
  } catch {
    return {};
  }
}

/**
 * Netgsm sesli mesaj durum / DTMF raporu.
 * Tuş 9 → çekici bildirim seviyesi 2 (OTP / hızlı SMS). Diğer tuşlar yok sayılır.
 */
export async function POST(request: NextRequest) {
  const secret =
    request.nextUrl.searchParams.get("secret") ??
    request.headers.get("x-netgsm-voice-secret");
  if (!sesliWebhookSecretGecerliMi(secret)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await bodyOku(request);
  try {
    const sonuc = await sesliWebhookDtmfIsle(body);
    if (sonuc.islem === "otp_sms") {
      console.info(
        "[netgsm-sesli-webhook] bildirim OTP SMS (seviye 2)",
        sonuc.cekiciId,
        "tus",
        sonuc.pushButton
      );
    } else if (sonuc.islem === "bulunamadi") {
      console.warn(
        "[netgsm-sesli-webhook] çekici bulunamadı",
        body.relationid,
        body.callee
      );
    }
    return NextResponse.json({ ok: true, ...sonuc });
  } catch (e) {
    console.error("[netgsm-sesli-webhook]", e);
    return NextResponse.json({ error: "İşlenemedi." }, { status: 500 });
  }
}

/** Sağlık / Netgsm URL doğrulama */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!sesliWebhookSecretGecerliMi(secret)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, servis: "netgsm-sesli" });
}
