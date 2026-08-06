import { NextRequest, NextResponse } from "next/server";
import { simulasyonGunPlanla } from "@/lib/simulasyon-ihale-db";

/**
 * Ertesi gün simülasyon ihale planlarını üretir (yoksa).
 * Railway cron: günde 1 (akşam) — POST /api/cron/simulasyon-planla
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

  const body = await request.json().catch(() => ({}));
  const hedefGun =
    typeof body.hedefGun === "string" && body.hedefGun.trim()
      ? body.hedefGun.trim().slice(0, 10)
      : undefined;

  const sonuc = await simulasyonGunPlanla({
    hedefGun,
    kaynagi: "cron",
  });

  return NextResponse.json({ ok: true, ...sonuc });
}
