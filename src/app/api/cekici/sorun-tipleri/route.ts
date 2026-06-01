import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { normalizeHizmetSorunTipleri } from "@/lib/cekici-sorun";
import { updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { SORUN_TIPLERI } from "@/lib/sorun-tipleri";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    tumTipler: SORUN_TIPLERI.map((t) => ({
      id: t.id,
      label: t.label,
      icon: t.icon,
    })),
    seciliTipler: cekici.hizmetSorunTipleri ?? [],
  });
}

export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { tipler } = body as { tipler?: unknown };
  if (!Array.isArray(tipler)) {
    return NextResponse.json({ error: "tipler dizisi gerekli." }, { status: 400 });
  }

  const secili = normalizeHizmetSorunTipleri(tipler as string[]);
  cekici.hizmetSorunTipleri = secili;
  await updateCekici(cekici);

  return NextResponse.json({
    mesaj:
      secili.length > 0
        ? `${secili.length} sorun tipi kaydedildi.`
        : "Sorun tipi seçilmedi — bu tür talepler için SMS almayacaksınız.",
    seciliTipler: secili,
  });
}
