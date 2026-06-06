import { NextRequest, NextResponse } from "next/server";
import { kayitKoduDogrula } from "@/lib/kayit-kodu";
import { davetKoduSutunuVar } from "@/lib/supabase/davet-schema";
import {
  kampanyaKoduSutunuVar,
  MIGRATION_014_MESAJ,
} from "@/lib/supabase/kampanya-schema";

export async function GET(request: NextRequest) {
  const kod = request.nextUrl.searchParams.get("kod")?.trim() ?? "";
  if (!kod) {
    return NextResponse.json(
      { gecerli: false, hata: "Kod girin." },
      { status: 400 }
    );
  }

  const [kampanyaTablosu, davetTablosu] = await Promise.all([
    kampanyaKoduSutunuVar(),
    davetKoduSutunuVar(),
  ]);
  if (!kampanyaTablosu && !davetTablosu) {
    return NextResponse.json(
      { gecerli: false, hata: MIGRATION_014_MESAJ },
      { status: 503 }
    );
  }

  const sonuc = await kayitKoduDogrula(kod);
  if (!sonuc.gecerli) {
    return NextResponse.json(
      { gecerli: false, hata: sonuc.hata },
      { status: sonuc.hata.includes("Geçersiz") ? 400 : 404 }
    );
  }

  return NextResponse.json({
    gecerli: true,
    tip: sonuc.tip,
    kod: sonuc.kod,
    bonus: sonuc.bonus,
    mesaj: sonuc.mesaj,
  });
}
