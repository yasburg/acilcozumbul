import { NextRequest, NextResponse } from "next/server";
import { otpDogrula } from "@/lib/musteri-otp";
import { funnelOlayKaydet } from "@/lib/funnel";
import { ipHash, istekIp } from "@/lib/request-ip";
import { musteriTelCookieAyarla } from "@/lib/musteri-auth";

export async function POST(request: NextRequest) {
  const { telefon, kod } = await request.json();
  const sonuc = await otpDogrula(telefon ?? "", kod ?? "");

  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  await funnelOlayKaydet({
    olay: "otp_dogrulandi",
    telefon: sonuc.telefon,
    ipHash: ipHash(istekIp(request)),
  });

  const response = NextResponse.json({
    mesaj: "Telefon doğrulandı.",
    telefon: sonuc.telefon,
  });

  musteriTelCookieAyarla(response, sonuc.telefon);

  return response;
}
