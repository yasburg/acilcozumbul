import { NextRequest, NextResponse } from "next/server";
import { otpDogrula } from "@/lib/musteri-otp";
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
