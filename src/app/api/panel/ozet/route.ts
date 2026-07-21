import { NextResponse } from "next/server";
import {
  countSmsLog,
  countTalepler,
  getCekiciler,
  getSmsLog,
  getTaleplerSince,
} from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { funnelOzetHesapla } from "@/lib/funnel";
import { smsDurumu } from "@/lib/sms-provider";
import { smsSaglikOzet } from "@/lib/sms-saglik";
import { hizmetVerenSayimHesapla } from "@/lib/hizmet-veren-sayim";

export async function GET() {
  await ensureSeedData();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [cekiciler, talepler30, sms7, talepSayisi, smsSayisi, smsGonderilen] =
    await Promise.all([
      getCekiciler(),
      getTaleplerSince(since30),
      getSmsLog({ sinceIso: since7, limit: 5000 }),
      countTalepler(),
      countSmsLog(),
      countSmsLog({ gonderildi: true }),
    ]);

  const huni = await funnelOzetHesapla(talepler30, 30);
  const gercekCekiciler = cekiciler.filter((c) => !c.testerHesap);
  const hizmetVerenler = hizmetVerenSayimHesapla(gercekCekiciler);
  const sms24 = sms7.filter((s) => s.gonderim >= since24);

  return NextResponse.json({
    cekiciSayisi: gercekCekiciler.length,
    talepSayisi,
    smsSayisi,
    smsGonderilen,
    smsDurum: smsDurumu(),
    huni,
    smsSaglik: smsSaglikOzet(sms24.length ? sms24 : sms7, 24),
    hizmetVerenler,
  });
}
