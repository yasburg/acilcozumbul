import { NextResponse } from "next/server";
import { getSmsLog } from "@/lib/db";
import { smsDurumu } from "@/lib/sms-provider";
import { smsSaglikOzet } from "@/lib/sms-saglik";

export async function GET() {
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const log = await getSmsLog({ sinceIso: since7, limit: 5000 });
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
