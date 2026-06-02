import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciEpostaOtpDogrula } from "@/lib/cekici-email-otp";

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { eposta, kod } = await request.json();
  const sonuc = await cekiciEpostaOtpDogrula(
    cekici.id,
    String(eposta ?? ""),
    String(kod ?? "")
  );

  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  return NextResponse.json({ success: true, dogrulandi: true });
}
