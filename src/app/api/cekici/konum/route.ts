import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { cekiciHizmetModu } from "@/lib/cekici-hizmet-bolge";
import { ensureSeedData } from "@/lib/seed";
import {
  hizmetBolgeSutunlariVar,
  MIGRATION_007_MESAJ,
} from "@/lib/supabase/bolge-schema";

export async function POST(request: NextRequest) {
  try {
    await ensureSeedData();
    const cekici = await getCurrentCekici();
    if (!cekici) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }

    if (!(await hizmetBolgeSutunlariVar())) {
      return NextResponse.json({ error: MIGRATION_007_MESAJ }, { status: 503 });
    }

  if (cekiciHizmetModu(cekici) !== "konum") {
    return NextResponse.json(
      { error: "Konum güncellemesi yalnızca konum modunda kullanılır." },
      { status: 400 }
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
  } catch (e) {
    console.error("[cekici/konum]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Konum kaydedilemedi." },
      { status: 500 }
    );
  }
}
