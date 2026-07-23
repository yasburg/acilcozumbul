import { NextRequest, NextResponse } from "next/server";
import { getCekiciByTelefon } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";
import {
  cekiciGirisOtpDogrula,
  cekiciGirisOtpTemizle,
} from "@/lib/cekici-giris-otp";
import { ensureSeedData } from "@/lib/seed";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "@/lib/telefon";
import { cekiciProfilHazirMi } from "@/lib/cekici-profil-hazir";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const body = await request.json();
  const { telefon, otpKod } = body;

  if (!telefonGecerliMi(telefon ?? "")) {
    return NextResponse.json(
      { error: telefonDogrulamaHatasi(String(telefon ?? "")) },
      { status: 400 }
    );
  }

  const tel = telefonNormalize(String(telefon).trim());
  const otp = await cekiciGirisOtpDogrula(tel, String(otpKod ?? ""));
  if (!otp.ok) {
    return NextResponse.json({ error: otp.hata }, { status: 400 });
  }

  const cekici = await getCekiciByTelefon(tel);
  if (!cekici || !cekici.aktif) {
    return NextResponse.json({ error: "Geçersiz giriş." }, { status: 401 });
  }

  await cekiciGirisOtpTemizle(tel);

  const hazir = cekiciProfilHazirMi(cekici);
  const response = NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    kurulumGerekli: !hazir,
    yonlendir: hazir ? "/cekici/panel" : "/kayit/kurulum",
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
