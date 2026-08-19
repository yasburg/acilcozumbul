import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import {
  efaturaMukellefiSorgula,
  faturaBelgeTipiBelirle,
} from "@/lib/trendyol-efaturam/mukellef";

/** Kurumsal fatura: vergi no ile Trendyol E-Faturam mükellef sorgusu */
export async function GET(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const vergiNo = request.nextUrl.searchParams.get("vergiNo") ?? "";
  const sonuc = await efaturaMukellefiSorgula(vergiNo);

  if (!sonuc.ok) {
    const status = sonuc.yapilandirildi ? 502 : 503;
    return NextResponse.json(
      {
        yapilandirildi: sonuc.yapilandirildi,
        hata: sonuc.hata,
        vergiNo: sonuc.vergiNo,
      },
      { status }
    );
  }

  return NextResponse.json({
    yapilandirildi: true,
    vergiNo: sonuc.vergiNo,
    mukellef: sonuc.mukellef,
    unvan: sonuc.unvan ?? null,
    alias: sonuc.alias ?? null,
    belgeTipi: faturaBelgeTipiBelirle({
      kurumsal: true,
      mukellef: sonuc.mukellef,
    }),
  });
}
