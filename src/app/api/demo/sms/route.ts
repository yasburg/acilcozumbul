import { NextRequest, NextResponse } from "next/server";
import { getSmsLog } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { getAktifDemoOturumRequest } from "@/lib/demo-oturum";

export async function GET(request: NextRequest) {
  await ensureSeedData();
  const prodLog = (
    await getSmsLog({
      limit: 50,
      sinceIso: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  ).map((s) => ({
    ...s,
    kaynak: "prod" as const,
  }));

  const demoOturum = await getAktifDemoOturumRequest(request);
  if (!demoOturum) {
    return NextResponse.json(prodLog);
  }

  const demoSms = [...demoOturum.durum.sms]
    .sort(
      (a, b) =>
        new Date(b.gonderim).getTime() - new Date(a.gonderim).getTime()
    )
    .map((s) => ({
      id: `demo-${s.id}`,
      cekiciTelefon: s.telefon,
      mesaj: s.mesaj,
      link: s.link ?? "",
      gonderim: s.gonderim,
      aliciTipi: s.aliciTipi,
      saglayici: "video-demo",
      gonderildi: false,
      kaynak: "video-demo" as const,
    }));

  return NextResponse.json([...demoSms, ...prodLog].slice(0, 50));
}
