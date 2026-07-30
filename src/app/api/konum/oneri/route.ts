import { NextRequest, NextResponse } from "next/server";
import {
  hedefKonumOnerileri,
  hedefServisGrupOnerileri,
  otoTamirAramaSorgusu,
} from "@/lib/konum-oneri";
import { parseIlIlce } from "@/lib/konum-parse";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const sorunTipi =
    request.nextUrl.searchParams.get("sorunTipi")?.trim() || "diger";
  const mod = request.nextUrl.searchParams.get("mod")?.trim() || "";
  const adres = request.nextUrl.searchParams.get("adres")?.trim() || "";
  const semtParam = request.nextUrl.searchParams.get("semt")?.trim() || "";
  const limit = Math.min(
    10,
    Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 3)
  );
  const queryOffset = Number(request.nextUrl.searchParams.get("offset")) || 0;
  const excludeParam = request.nextUrl.searchParams.get("exclude");
  const excludeAdres =
    excludeParam?.split("|").map((s) => s.trim()).filter(Boolean) ?? [];
  const excludeIdsParam = request.nextUrl.searchParams.get("excludeIds");
  const excludePlaceIds =
    excludeIdsParam?.split("|").map((s) => s.trim()).filter(Boolean) ?? [];

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat ve lng gerekli." }, { status: 400 });
  }

  if (mod === "servis") {
    const { il, ilce } = adres ? parseIlIlce(adres) : { il: null, ilce: null };
    const semt = semtParam || ilce || undefined;
    const sonuc = await hedefServisGrupOnerileri(lat, lng, {
      excludeAdres,
      excludePlaceIds,
      semt,
      il: il || undefined,
    });
    return NextResponse.json({
      oneriler: sonuc.oneriler,
      kaynak: sonuc.kaynak,
      acikFiltrelendi: sonuc.acikFiltrelendi,
      semt: sonuc.semt ?? semt ?? null,
      il: il ?? null,
      sorgu: otoTamirAramaSorgusu({ semt, il }),
      hata: sonuc.hata ?? null,
      gruplar: {
        oto_tamir: sonuc.oneriler.filter((o) => o.kategori === "oto_tamir"),
        oto_sanayi: sonuc.oneriler.filter((o) => o.kategori === "oto_sanayi"),
      },
    });
  }

  const sonuc = await hedefKonumOnerileri(lat, lng, sorunTipi, {
    limit,
    excludeAdres,
    excludePlaceIds,
    queryOffset,
  });

  return NextResponse.json({
    oneriler: sonuc.oneriler,
    kaynak: sonuc.kaynak,
    acikFiltrelendi: sonuc.acikFiltrelendi,
  });
}

