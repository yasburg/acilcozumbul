import { NextRequest, NextResponse } from "next/server";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { cronPeriyodikCalistir } from "@/lib/cron-periyodik";

/**
 * 5 dakikalık cron: simülasyon aç/kapat + memnuniyet SMS + ihale hatırlatma
 * + toplu SMS kuyruk kurtarma.
 * Railway: POST /api/cron/simulasyon-calistir
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

  const sonuc = await cronPeriyodikCalistir({ baseUrl });

  return NextResponse.json({
    ok: sonuc.hatalar.length === 0,
    acilan: sonuc.sim.acilan,
    kapanan: sonuc.sim.kapanan,
    hatalar: [...sonuc.sim.hatalar, ...sonuc.hatalar],
    memnuniyet: sonuc.memnuniyet,
    ihale: sonuc.ihale,
    topluSms: sonuc.topluSms,
    demoTakip: sonuc.demoTakip,
  });
}
