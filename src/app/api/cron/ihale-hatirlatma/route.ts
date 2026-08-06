import { NextRequest, NextResponse } from "next/server";
import { isleIhaleHatirlatmalari } from "@/lib/ihale-hatirlatma-db";
import { smsBaseUrl } from "@/lib/sms-base-url";

/**
 * Uzun (acil olmayan) açık ihalelerde 3 hatırlatma dalgası.
 * Müşteri: teklifleri kontrol et · Çekici: teklif vermediği talep linki
 * Toplu SMS kuyruğu kullanılır.
 *
 * Railway cron: POST /api/cron/ihale-hatirlatma
 * Header: Authorization: Bearer CRON_SECRET
 * Öneri: her 5–10 dk
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET tanımlı değil." },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const baseUrl = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );

  const ozet = await isleIhaleHatirlatmalari(baseUrl);
  return NextResponse.json({ ok: true, ...ozet });
}
