import { NextRequest, NextResponse } from "next/server";
import { getCekiciByToken } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";

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
    kredi: cekici.kredi,
  });

  response.cookies.set(CEKICI_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
