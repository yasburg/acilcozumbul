import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
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

  if (!krediPaketBul(paketTl)) {
    return NextResponse.json(
      { error: "Geçerli bir paket seçin (100, 250, 500 veya 1000 TL)." },
      { status: 400 }
    );
  }

  const odeme = await olusturBekleyenOdeme(cekici.id, paketTl);

  return NextResponse.json({
    odemeId: odeme.id,
    miktar: odeme.miktar,
    tutar: odeme.tutar,
    garantiAktif: garantiYapilandirildi(),
  });
}
