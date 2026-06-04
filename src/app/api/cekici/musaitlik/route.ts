import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { musaitlikOzeti } from "@/lib/cekici-musaitlik";
import { ensureSeedData } from "@/lib/seed";

function saatGecerliMi(v: unknown): v is string {
  return typeof v === "string" && /^([01]?\d|2[0-3]):[0-5]\d$/.test(v.trim());
}

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    musaitlikAktif: Boolean(cekici.musaitlikAktif),
    musaitlikBaslangic: cekici.musaitlikBaslangic ?? "08:00",
    musaitlikBitis: cekici.musaitlikBitis ?? "22:00",
    musaitlikGunler: cekici.musaitlikGunler ?? [1, 2, 3, 4, 5, 6, 7],
    ozet: musaitlikOzeti(cekici),
  });
}

export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const musaitlikAktif = Boolean(body.musaitlikAktif);
  const baslangic =
    typeof body.musaitlikBaslangic === "string"
      ? body.musaitlikBaslangic.trim()
      : "08:00";
  const bitis =
    typeof body.musaitlikBitis === "string"
      ? body.musaitlikBitis.trim()
      : "22:00";

  if (musaitlikAktif && (!saatGecerliMi(baslangic) || !saatGecerliMi(bitis))) {
    return NextResponse.json(
      { error: "Saatleri SS:DD formatında girin (ör. 08:00)." },
      { status: 400 }
    );
  }

  let musaitlikGunler: number[] | undefined;
  if (Array.isArray(body.musaitlikGunler)) {
    const parsed = body.musaitlikGunler
      .map((g: unknown) => Number(g))
      .filter((g: number) => g >= 1 && g <= 7);
    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "En az bir gün seçin." },
        { status: 400 }
      );
    }
    musaitlikGunler = parsed;
  }

  const guncel = {
    ...cekici,
    musaitlikAktif,
    musaitlikBaslangic: baslangic,
    musaitlikBitis: bitis,
    musaitlikGunler: musaitlikGunler ?? cekici.musaitlikGunler ?? [1, 2, 3, 4, 5, 6, 7],
  };
  await updateCekici(guncel);

  return NextResponse.json({
    mesaj: musaitlikAktif
      ? "Müsaitlik saati kaydedildi. Bu saatler dışında talep SMS'i almayacaksınız."
      : "Müsaitlik kısıtı kapatıldı — 7/24 bildirim alırsınız.",
    ozet: musaitlikOzeti(guncel),
  });
}
