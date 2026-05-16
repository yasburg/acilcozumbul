import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { olusturBekleyenOdeme } from "@/lib/odeme";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { miktar } = await request.json();
  const adet = Number(miktar);

  if (!adet || adet < 1 || adet > 100) {
    return NextResponse.json(
      { error: "Geçerli bir kredi miktarı girin (1-100)." },
      { status: 400 }
    );
  }

  const odeme = await olusturBekleyenOdeme(cekici.id, adet);

  return NextResponse.json({
    odemeId: odeme.id,
    miktar: odeme.miktar,
    tutar: odeme.tutar,
  });
}
