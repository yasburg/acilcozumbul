import { NextRequest, NextResponse } from "next/server";
import { otpDogrula } from "@/lib/musteri-otp";
import { funnelOlayKaydet } from "@/lib/funnel";
import { ipHash, istekIp } from "@/lib/request-ip";
import {
  MUSTERI_TEL_COOKIE,
  musteriTelCookieDegeri,
} from "@/lib/musteri-auth";

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

  response.cookies.set(MUSTERI_TEL_COOKIE, musteriTelCookieDegeri(sonuc.telefon), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30,
    path: "/",
  });

  return response;
}
