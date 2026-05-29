import { NextResponse } from "next/server";
import { getCekiciler, getSmsLog, getTalepler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { smsDurumu } from "@/lib/sms-provider";

export async function GET() {
  await ensureSeedData();
  const [cekiciler, talepler, smsLog] = await Promise.all([
    getCekiciler(),
    getTalepler(),
    getSmsLog(),
  ]);

  const smsGonderilen = smsLog.filter((s) => s.gonderildi).length;

  return NextResponse.json({
    cekiciSayisi: cekiciler.length,
    talepSayisi: talepler.length,
    smsSayisi: smsLog.length,
    smsGonderilen,
    smsDurum: smsDurumu(),
  });
}
