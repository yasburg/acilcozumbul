import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

/** Kazanan çekici yola çıkarken konum paylaşır (hizmet modundan bağımsız) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (talep.kazananCekiciId !== cekici.id) {
    return NextResponse.json(
      { error: "Bu talep için konum paylaşılamaz." },
      { status: 403 }
    );
  }

  const { lat, lng } = await request.json();
  const latN = Number(lat);
  const lngN = Number(lng);
  if (
    !Number.isFinite(latN) ||
    !Number.isFinite(lngN) ||
    latN < -90 ||
    latN > 90 ||
    lngN < -180 ||
    lngN > 180
  ) {
    return NextResponse.json({ error: "Geçersiz koordinat." }, { status: 400 });
  }

  cekici.konumLat = latN;
  cekici.konumLng = lngN;
  cekici.konumGuncelleme = new Date().toISOString();
  await updateCekici(cekici);

  return NextResponse.json({
    ok: true,
    konumGuncelleme: cekici.konumGuncelleme,
  });
}
