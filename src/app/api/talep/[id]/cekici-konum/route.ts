import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { surusSuresiDk } from "@/lib/google-maps";
import { koordinatGecerli } from "@/lib/koordinat";

const KONUM_TAZE_MS = 180_000;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const talep = await getTalepById(id);

  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (!talep.kazananCekiciId) {
    return NextResponse.json({ konum: null, etaDk: null, cekiciAd: null });
  }

  const cekici = await getCekiciById(talep.kazananCekiciId);
  if (!cekici?.konumLat || !cekici?.konumLng) {
    return NextResponse.json({
      konum: null,
      guncelleme: cekici?.konumGuncelleme ?? null,
      taze: false,
      etaDk: null,
      cekiciAd: cekici?.ad ?? null,
    });
  }

  const konum = { lat: cekici.konumLat, lng: cekici.konumLng };
  const guncelleme = cekici.konumGuncelleme ?? null;
  const taze =
    !!guncelleme &&
    Date.now() - new Date(guncelleme).getTime() < KONUM_TAZE_MS * 3;

  let etaDk: number | null = null;
  if (koordinatGecerli(talep.konum)) {
    const sure = await surusSuresiDk(konum, {
      lat: talep.konum.lat,
      lng: talep.konum.lng,
    });
    if (sure.dk) etaDk = sure.dk;
  }

  return NextResponse.json({
    konum,
    guncelleme,
    taze,
    etaDk,
    cekiciAd: cekici.ad,
  });
}
