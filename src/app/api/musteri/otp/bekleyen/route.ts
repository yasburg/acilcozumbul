import { NextRequest, NextResponse } from "next/server";
import { bekleyenOtpBilgisi } from "@/lib/musteri-otp";

export async function GET(request: NextRequest) {
  const telefon = request.nextUrl.searchParams.get("telefon") ?? "";
  const bilgi = await bekleyenOtpBilgisi(telefon);

  return NextResponse.json({
    bekliyor: bilgi.bekliyor,
    yenidenGonderSn: bilgi.yenidenGonderSn,
    gelistirmeKodu: bilgi.gelistirmeKodu,
    telefon: bilgi.telefon,
  });
}
