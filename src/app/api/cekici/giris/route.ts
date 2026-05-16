import { NextRequest, NextResponse } from "next/server";
import { getCekiciByTelefon, getCekiciByToken } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const body = await request.json();
  const { telefon, sifre, token } = body;

  let cekici;

  if (token) {
    cekici = await getCekiciByToken(token);
  } else if (telefon && sifre) {
    cekici = await getCekiciByTelefon(telefon);
    if (cekici && cekici.sifre !== sifre.trim()) {
      return NextResponse.json({ error: "Telefon veya şifre hatalı." }, { status: 401 });
    }
  } else {
    return NextResponse.json(
      { error: "Telefon/şifre veya token gerekli." },
      { status: 400 }
    );
  }

  if (!cekici || !cekici.aktif) {
    return NextResponse.json({ error: "Geçersiz giriş." }, { status: 401 });
  }

  const response = NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    kredi: cekici.kredi,
  });

  response.cookies.set(CEKICI_COOKIE, cekici.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
