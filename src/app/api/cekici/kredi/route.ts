import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { miktar, kartNo, sonKullanma, cvv } = await request.json();
  const adet = Number(miktar);

  if (!adet || adet < 1 || adet > 100) {
    return NextResponse.json(
      { error: "Geçerli bir kredi miktarı girin (1-100)." },
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

  cekici.kredi += adet;
  await updateCekici(cekici);

  const tutar = adet * 50;

  return NextResponse.json({
    success: true,
    eklenenKredi: adet,
    toplamKredi: cekici.kredi,
    odeme: {
      tutar,
      paraBirimi: "TRY",
      referans: `VPOS-${Date.now()}`,
      mesaj: "Ödeme başarıyla alındı (sanal POS demo).",
    },
  });
}
