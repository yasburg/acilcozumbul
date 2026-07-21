import { NextRequest, NextResponse } from "next/server";
import { CEKICI_COOKIE, getCurrentCekici } from "@/lib/auth";
import { cekiciGirisSifreKontrol } from "@/lib/cekici-auth";
import {
  cekiciHesapSilOtpDogrula,
  cekiciHesapSilOtpSil,
  hesapSilOnayMetniGecerliMi,
} from "@/lib/cekici-hesap-sil-otp";
import { silCekiciCascade } from "@/lib/cekici-sil";

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sifre = String((body as { sifre?: string }).sifre ?? "").trim();
  const kod = String((body as { kod?: string }).kod ?? "").trim();
  const onayMetni = String((body as { onayMetni?: string }).onayMetni ?? "");

  if (!hesapSilOnayMetniGecerliMi(onayMetni)) {
    return NextResponse.json(
      { error: "Onay metnini doğru yazın." },
      { status: 400 }
    );
  }
  if (!sifre) {
    return NextResponse.json(
      { error: "Hesabı silmek için şifrenizi girin." },
      { status: 400 }
    );
  }
  if (!kod) {
    return NextResponse.json(
      { error: "SMS ile gelen kodu girin." },
      { status: 400 }
    );
  }

  const sifreOk = await cekiciGirisSifreKontrol(cekici, sifre);
  if (!sifreOk) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  const otp = await cekiciHesapSilOtpDogrula(cekici.telefon, kod);
  if (!otp.ok) {
    return NextResponse.json({ error: otp.hata }, { status: 400 });
  }

  try {
    await silCekiciCascade(cekici.id);
    await cekiciHesapSilOtpSil(cekici.telefon).catch(() => undefined);
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Hesap silinemedi.";
    return NextResponse.json({ error: mesaj }, { status: 400 });
  }

  const response = NextResponse.json({
    mesaj: "Hesabınız silindi.",
  });
  response.cookies.set(CEKICI_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
