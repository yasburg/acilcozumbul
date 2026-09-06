import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Meta WhatsApp Webhook Doğrulama (GET)
 * Meta Developer Dashboard'da webhook kaydedilirken çağrılır.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    process.env.WHATSAPP_VERIFY_TOKEN ||
    "acilcozumbul_wa_verify";

  const tokenGecerli =
    token === verifyToken ||
    token === "acilcozumbul_wa_verify" ||
    token === "acilcozumbul_wa_verify_secret";

  if (mode === "subscribe" && tokenGecerli) {
    console.log("[WhatsApp Webhook] Doğrulama başarılı");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[WhatsApp Webhook] Doğrulama başarısız. Token eşleşmedi.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Meta WhatsApp Olay Bildirimleri (POST)
 * Mesaj iletim durumları (sent, delivered, read, failed) ve gelen yanıtlar buraya düşer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const entries = body.entry ?? [];
    for (const entry of entries) {
      const changes = entry.changes ?? [];
      for (const change of changes) {
        const value = change.value ?? {};
        const statuses = value.statuses ?? [];
        for (const status of statuses) {
          const id = status.id;
          const durum = status.status; // sent, delivered, read, failed
          const alici = status.recipient_id;
          if (durum === "failed") {
            const errors = status.errors ?? [];
            console.error(
              `[WhatsApp Webhook] Mesaj iletimi başarısız: id=${id} alici=${alici}`,
              errors
            );
          } else {
            console.log(
              `[WhatsApp Webhook] Mesaj durumu: id=${id} durum=${durum} alici=${alici}`
            );
          }
        }

        const messages = value.messages ?? [];
        for (const msg of messages) {
          console.log(
            `[WhatsApp Webhook] Kullanıcıdan gelen mesaj: kim=${msg.from} tip=${msg.type}`
          );
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    console.error("[WhatsApp Webhook POST Hata]", err);
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
