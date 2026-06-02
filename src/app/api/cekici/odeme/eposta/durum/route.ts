import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import {
  bekleyenCekiciEpostaOtp,
  cekiciEpostaDogrulandiMi,
} from "@/lib/cekici-email-otp";
import { epostaGecerliMi } from "@/lib/eposta";

export async function GET(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const eposta = request.nextUrl.searchParams.get("eposta") ?? cekici.faturaEposta ?? "";

  if (!epostaGecerliMi(eposta)) {
    return NextResponse.json({
      dogrulandi: false,
      bekliyor: false,
      yenidenGonderSn: 0,
    });
  }

  const dogrulandi = await cekiciEpostaDogrulandiMi(cekici.id, eposta);
  const otp = await bekleyenCekiciEpostaOtp(cekici.id, eposta);

  return NextResponse.json({
    dogrulandi,
    bekliyor: otp.bekliyor,
    yenidenGonderSn: otp.yenidenGonderSn,
    gelistirmeKodu: otp.gelistirmeKodu,
    kayitliEposta: cekici.faturaEposta ?? null,
  });
}
