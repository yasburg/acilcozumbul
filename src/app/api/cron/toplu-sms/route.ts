import { NextRequest, NextResponse } from "next/server";
import { tetikleTopluSmsKuyruk } from "@/lib/toplu-sms-is-db";
import {
  MIGRATION_033_MESAJ,
  topluSmsIsTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";

/**
 * Zamanı gelen / yarım kalan toplu SMS işlerini sürdürür.
 * Railway cron: POST /api/cron/toplu-sms (her 1–2 dk önerilir)
 * Header: Authorization: Bearer CRON_SECRET
 *
 * Not: Uygulama süreci içinde de 8 sn'lik scheduler çalışır;
 * cron yalnızca redeploy / cold-start boşluklarını kapatır.
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

  if (!(await topluSmsIsTablolariVar())) {
    return NextResponse.json({
      ok: false,
      error: MIGRATION_033_MESAJ,
      islenen: 0,
    });
  }

  const sonuc = await tetikleTopluSmsKuyruk();
  return NextResponse.json({ ok: true, ...sonuc });
}
