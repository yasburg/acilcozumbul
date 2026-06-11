import { NextResponse } from "next/server";
import { getCekiciler, getSmsLog, getTalepler } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { funnelOzetHesapla } from "@/lib/funnel";
import { smsDurumu } from "@/lib/sms-provider";
import { smsSaglikOzet } from "@/lib/sms-saglik";
import { hizmetVerenSayimHesapla } from "@/lib/hizmet-veren-sayim";

export async function GET() {
  await ensureSeedData();
  const [cekiciler, talepler, smsLog] = await Promise.all([
    getCekiciler(),
    getTalepler(),
    getSmsLog(),
  ]);

  const smsGonderilen = smsLog.filter((s) => s.gonderildi).length;
  const huni = await funnelOzetHesapla(talepler, 30);
  const hizmetVerenler = hizmetVerenSayimHesapla(cekiciler);

  return NextResponse.json({
    cekiciSayisi: cekiciler.length,
    talepSayisi: talepler.length,
    smsSayisi: smsLog.length,
    smsGonderilen,
    smsDurum: smsDurumu(),
    huni,
    smsSaglik: smsSaglikOzet(smsLog, 24),
    hizmetVerenler,
  });
}
