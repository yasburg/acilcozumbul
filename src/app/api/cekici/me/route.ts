import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();

  if (!cekici) {
    return NextResponse.json({ error: "Giriş yapılmamış." }, { status: 401 });
  }

  return NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    telefon: cekici.telefon,
    kredi: cekici.kredi,
    sehir: cekici.sehir,
    hizmetModu: cekici.hizmetModu ?? "il_ilce",
    menzilKm: cekici.menzilKm ?? 30,
  });
}
