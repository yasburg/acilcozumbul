import { NextRequest, NextResponse } from "next/server";
import { getCekiciByTelefon } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "@/lib/telefon";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const body = await request.json();
  const { telefon, sifre } = body;

  let cekici;

  if (telefon && sifre) {
    if (!telefonGecerliMi(telefon)) {
      return NextResponse.json(
        { error: telefonDogrulamaHatasi(telefon) },
        { status: 400 }
      );
    }
    const tel = telefonNormalize(telefon);
    cekici = await getCekiciByTelefon(tel);
    if (cekici && cekici.sifre !== String(sifre).trim()) {
      return NextResponse.json({ error: "Telefon veya şifre hatalı." }, { status: 401 });
    }
  } else {
    return NextResponse.json(
      { error: "Telefon ve şifre gerekli." },
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
