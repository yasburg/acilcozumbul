import { NextRequest, NextResponse } from "next/server";
import { CEKICI_COOKIE, getCurrentCekici } from "@/lib/auth";
import { cekiciGirisSifreKontrol } from "@/lib/cekici-auth";
import { silCekiciCascade } from "@/lib/cekici-sil";

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sifre = String((body as { sifre?: string }).sifre ?? "").trim();
  if (!sifre) {
    return NextResponse.json(
      { error: "Hesabı silmek için şifrenizi girin." },
      { status: 400 }
    );
  }

  const sifreOk = await cekiciGirisSifreKontrol(cekici, sifre);
  if (!sifreOk) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  try {
    await silCekiciCascade(cekici.id);
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
