import { NextRequest, NextResponse } from "next/server";
import { topluMemnuniyetSmsGonder } from "@/lib/memnuniyet";

/**
 * Zamanı gelen memnuniyet SMS'lerini gönderir.
 * Railway cron: POST /api/cron/memnuniyet-sms
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

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const gonderilen = await topluMemnuniyetSmsGonder(baseUrl);

  return NextResponse.json({ ok: true, gonderilen });
}
