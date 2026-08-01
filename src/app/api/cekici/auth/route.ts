import { NextRequest, NextResponse } from "next/server";
import { getCekiciByToken } from "@/lib/db";
import { CEKICI_COOKIE, cekiciOturumCookieAyarlari } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token gerekli." }, { status: 400 });
  }

  const cekici = await getCekiciByToken(token);
  if (!cekici) {
    return NextResponse.json({ error: "Geçersiz giriş." }, { status: 401 });
  }

  const response = NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    kredi: cekiciToplamKredi(cekici),
  });

  response.cookies.set(CEKICI_COOKIE, token, cekiciOturumCookieAyarlari(true));

  return response;
}
