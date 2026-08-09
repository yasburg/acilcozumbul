import { NextResponse } from "next/server";
import { getSmsLog } from "@/lib/db";
import { smsDurumu } from "@/lib/sms-provider";
import { smsSaglikOzet } from "@/lib/sms-saglik";
import {
  getSesliMesajLog,
  sesliSaglikOzet,
} from "@/lib/sesli-mesaj-log";

export async function GET() {
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [log, sesliLog] = await Promise.all([
    getSmsLog({ sinceIso: since7, limit: 5000 }),
    getSesliMesajLog({ sinceIso: since7, limit: 5000 }),
  ]);
  const saglik24 = smsSaglikOzet(log, 24);
  const saglik7gun = smsSaglikOzet(log, 24 * 7);
  const sesli24 = sesliSaglikOzet(sesliLog, 24);
  const sesli7gun = sesliSaglikOzet(sesliLog, 24 * 7);

  return NextResponse.json({
    durum: smsDurumu(),
    kayitlar: log.slice(0, 100),
    saglik: {
      son24Saat: saglik24,
      son7Gun: saglik7gun,
    },
    sesli: {
      son24Saat: sesli24,
      son7Gun: sesli7gun,
      sonKayitlar: sesliLog.slice(0, 40),
    },
  });
}
