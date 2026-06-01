import { NextRequest, NextResponse } from "next/server";
import { hedefKonumOnerileri } from "@/lib/konum-oneri";

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const sorunTipi = request.nextUrl.searchParams.get("sorunTipi")?.trim() || "diger";
  const limit = Math.min(
    5,
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
