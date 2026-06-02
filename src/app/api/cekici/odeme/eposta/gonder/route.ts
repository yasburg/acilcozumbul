import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciEpostaOtpGonder } from "@/lib/cekici-email-otp";

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { eposta } = await request.json();
  const sonuc = await cekiciEpostaOtpGonder(cekici.id, String(eposta ?? ""));

  if (!sonuc.ok) {
    return NextResponse.json(
      { error: sonuc.hata, yenidenGonderSn: sonuc.yenidenGonderSn },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    yenidenGonderSn: sonuc.yenidenGonderSn,
    gelistirmeKodu: sonuc.gelistirmeKodu,
    demo: sonuc.demo,
  });
}
