import { NextRequest, NextResponse } from "next/server";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { simulasyonCalistir } from "@/lib/simulasyon-ihale-db";

/**
 * Zamanı gelen simülasyon ihalelerini açar / hayalet kazananla kapatır.
 * Railway cron: her 5–10 dk — POST /api/cron/simulasyon-calistir
 * Header: Authorization: Bearer CRON_SECRET
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

  const sonuc = await simulasyonCalistir({ baseUrl });

  return NextResponse.json({ ok: true, ...sonuc });
}
