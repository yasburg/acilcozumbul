import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addCekici, getCekiciByTelefon } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "@/lib/telefon";
import type { Cekici } from "@/lib/types";
import { tumSorunTipIdleri } from "@/lib/sorun-tipleri";

const SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana"];

export async function POST(request: NextRequest) {
  await ensureSeedData();

  const { ad, telefon, sehir, sifre } = await request.json();

  if (!ad?.trim() || !telefon?.trim() || !sehir?.trim() || !sifre?.trim()) {
    return NextResponse.json(
      { error: "Tüm alanları doldurun." },
      { status: 400 }
    );
  }

  if (!telefonGecerliMi(telefon)) {
    return NextResponse.json(
      { error: telefonDogrulamaHatasi(telefon) },
      { status: 400 }
    );
  }

  const tel = telefonNormalize(telefon);

  if (sifre.length < 6) {
    return NextResponse.json(
      { error: "Şifre en az 6 karakter olmalı." },
      { status: 400 }
    );
  }

  if (!SEHIRLER.includes(sehir)) {
    return NextResponse.json({ error: "Geçerli bir şehir seçin." }, { status: 400 });
  }

  const mevcut = await getCekiciByTelefon(tel);
  if (mevcut) {
    return NextResponse.json(
      { error: "Bu telefon numarası zaten kayıtlı." },
      { status: 409 }
    );
  }

  const token = randomUUID();
  const cekici: Cekici = {
    id: randomUUID(),
    ad: ad.trim(),
    telefon: tel,
    token,
    sifre: sifre.trim(),
    kredi: 0,
    sehir,
    hizmetIlceleri: [],
    hizmetSorunTipleri: tumSorunTipIdleri(),
    aktif: true,
    kayitTarihi: new Date().toISOString(),
  };

  await addCekici(cekici);

  const response = NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    mesaj: "Kayıt başarılı. Hoş geldiniz!",
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
