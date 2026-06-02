import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciEpostaDogrulandiMi } from "@/lib/cekici-email-otp";
import { epostaNormalize } from "@/lib/eposta";
import { garantiYapilandirildi } from "@/lib/garanti/config";
import { krediPaketBul } from "@/lib/kredi-fiyat";
import { olusturBekleyenOdeme } from "@/lib/odeme";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const paketTl = Number(body.paketTl ?? body.miktar);
  const eposta = epostaNormalize(String(body.eposta ?? cekici.faturaEposta ?? ""));

  if (!krediPaketBul(paketTl)) {
    return NextResponse.json(
      { error: "Geçerli bir paket seçin (100, 250, 500 veya 1000 TL)." },
      { status: 400 }
    );
  }

  if (!(await cekiciEpostaDogrulandiMi(cekici.id, eposta))) {
    return NextResponse.json(
      { error: "Ödeme için e-posta adresinizi doğrulayın." },
      { status: 403 }
    );
  }

  const odeme = await olusturBekleyenOdeme(cekici.id, paketTl, eposta);

  return NextResponse.json({
    odemeId: odeme.id,
    miktar: odeme.miktar,
    tutar: odeme.tutar,
    listeFiyati: odeme.listeFiyati,
    garantiAktif: garantiYapilandirildi(),
  });
}
