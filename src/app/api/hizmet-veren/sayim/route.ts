import { NextRequest, NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import {
  hizmetVerenSatirBul,
  hizmetVerenSayimHesapla,
} from "@/lib/hizmet-veren-sayim";
import { ensureSeedData } from "@/lib/seed";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";

export async function GET(request: NextRequest) {
  await ensureSeedData();
  const cekiciler = await getCekiciler();
  const ozet = hizmetVerenSayimHesapla(cekiciler);

  const sorunTipi = request.nextUrl.searchParams.get("sorunTipi")?.trim();
  if (sorunTipi && gecerliSorunTipi(sorunTipi)) {
    const satir = hizmetVerenSatirBul(ozet, sorunTipi);
    return NextResponse.json({
      sorunTipi,
      aktif: satir?.aktif ?? 0,
      cevrimici: satir?.cevrimici ?? 0,
      guncelleme: ozet.guncelleme,
    });
  }

  return NextResponse.json(ozet);
}
