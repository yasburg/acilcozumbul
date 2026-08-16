import { NextRequest, NextResponse } from "next/server";
import { processGarantiAbonelikYenilemeleri } from "@/lib/abonelik-yenileme";

/**
 * Garanti orderlistinq yenileme mutabakatı + past_due/retry.
 * Header: Authorization: Bearer CRON_SECRET veya GARANTI_ORDER_INQUIRY_KEY
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const inquiryKey = process.env.GARANTI_ORDER_INQUIRY_KEY;
  const secret = inquiryKey || cronSecret;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET veya GARANTI_ORDER_INQUIRY_KEY tanımlı değil." },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  const ok =
    auth === `Bearer ${secret}` ||
    (cronSecret && auth === `Bearer ${cronSecret}`) ||
    (inquiryKey && auth === `Bearer ${inquiryKey}`);
  if (!ok) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const ozet = await processGarantiAbonelikYenilemeleri({
      startDate: typeof body.startDate === "string" ? body.startDate : undefined,
      endDate: typeof body.endDate === "string" ? body.endDate : undefined,
    });
    return NextResponse.json({ ok: true, ...ozet });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yenileme hatası.";
    console.error("[cron/garanti-abonelik-yenileme]", e);
    return NextResponse.json({ ok: false, error: msg.slice(0, 500) });
  }
}
