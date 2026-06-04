import { NextResponse } from "next/server";
import { getSmsLog } from "@/lib/db";
import { smsDurumu } from "@/lib/sms-provider";
import { smsSaglikOzet } from "@/lib/sms-saglik";

export async function GET() {
  const log = await getSmsLog();
  const saglik24 = smsSaglikOzet(log, 24);
  const saglik7gun = smsSaglikOzet(log, 24 * 7);

  return NextResponse.json({
    durum: smsDurumu(),
    kayitlar: log.slice(0, 100),
    saglik: {
      son24Saat: saglik24,
      son7Gun: saglik7gun,
    },
  });
}
