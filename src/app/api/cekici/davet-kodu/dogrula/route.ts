import { NextRequest, NextResponse } from "next/server";
import { kayitKoduDogrula } from "@/lib/kayit-kodu";

/** @deprecated KayitKoduDogrula kullanın — geriye dönük uyumluluk */
export async function GET(request: NextRequest) {
  const kod = request.nextUrl.searchParams.get("kod")?.trim() ?? "";
  const sonuc = await kayitKoduDogrula(kod);

  if (!sonuc.gecerli) {
    return NextResponse.json(
      { gecerli: false, hata: sonuc.hata },
      { status: 404 }
    );
  }

  return NextResponse.json({
    gecerli: true,
    kod: sonuc.kod,
    tip: sonuc.tip,
    davetliBonus: sonuc.bonus,
    mesaj: sonuc.mesaj,
  });
}
