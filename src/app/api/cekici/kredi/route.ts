import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { krediPaketBul, krediPaketOdenecekTL } from "@/lib/kredi-fiyat";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { paketTl, miktar, kartNo, sonKullanma, cvv } = await request.json();
  const paket = krediPaketBul(Number(paketTl ?? miktar));

  if (!paket) {
    return NextResponse.json(
      { error: "Geçerli bir paket seçin (100, 250, 500 veya 1000 TL)." },
      { status: 400 }
    );
  }

  if (!kartNo || !sonKullanma || !cvv) {
    return NextResponse.json(
      { error: "Kart bilgilerini doldurun." },
      { status: 400 }
    );
  }

  // Sanal POS simülasyonu — her zaman başarılı
  await new Promise((r) => setTimeout(r, 800));

  cekici.kredi += paket.kredi;
  await updateCekici(cekici);

  const tutar = krediPaketOdenecekTL(paket);

  return NextResponse.json({
    success: true,
    eklenenKredi: paket.kredi,
    toplamKredi: cekici.kredi,
    odeme: {
      tutar,
      paraBirimi: "TRY",
      referans: `VPOS-${Date.now()}`,
      mesaj: "Ödeme başarıyla alındı (sanal POS demo).",
    },
  });
}
