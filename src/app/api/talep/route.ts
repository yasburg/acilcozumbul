import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { notifyCekiciler, notifyMusteri } from "@/lib/sms";
import { IHALE_SURE_DK } from "@/lib/ihale";
import { parseIlIlce } from "@/lib/konum-parse";
import { sorunMetniOlustur, sorunTipiBul } from "@/lib/sorun-tipleri";
import type { Talep } from "@/lib/types";

export async function POST(request: NextRequest) {
  await ensureSeedData();

  const body = await request.json();
  const { ad, soyad, telefon, konum, hedefKonum, sorunTipi, sorunDetay, sorun } = body;

  const tip = sorunTipi?.trim() || "diger";
  if (!sorunTipiBul(tip) && !sorun) {
    return NextResponse.json({ error: "Geçerli bir sorun seçin." }, { status: 400 });
  }

  const sorunMetni =
    sorun?.trim() || sorunMetniOlustur(tip, sorunDetay?.trim());

  if (tip === "diger" && !sorunDetay?.trim() && !sorun?.trim()) {
    return NextResponse.json(
      { error: "Lütfen sorununuzu kısaca açıklayın." },
      { status: 400 }
    );
  }

  if (!ad || !soyad || !telefon || !konum?.adres || !sorunMetni) {
    return NextResponse.json(
      { error: "Tüm alanları doldurun." },
      { status: 400 }
    );
  }

  if (!hedefKonum?.adres) {
    return NextResponse.json(
      { error: "Aracın çekileceği adres gerekli." },
      { status: 400 }
    );
  }

  const olusturulma = new Date();
  const ihaleBitis = new Date(olusturulma.getTime() + IHALE_SURE_DK * 60 * 1000);
  const { il: konumIl, ilce: konumIlce } = parseIlIlce(konum.adres.trim());

  const talep: Talep = {
    id: randomUUID(),
    ad: ad.trim(),
    soyad: soyad.trim(),
    telefon: telefon.trim(),
    konum: {
      lat: konum.lat ?? 0,
      lng: konum.lng ?? 0,
      adres: konum.adres.trim(),
    },
    konumIl: konumIl ?? undefined,
    konumIlce: konumIlce ?? undefined,
    hedefKonum: {
      lat: hedefKonum.lat ?? 0,
      lng: hedefKonum.lng ?? 0,
      adres: hedefKonum.adres.trim(),
    },
    sorun: sorunMetni,
    sorunTipi: tip,
    sorunDetay: sorunDetay?.trim(),
    durum: "ihalede",
    olusturulma: olusturulma.toISOString(),
    ihaleBitis: ihaleBitis.toISOString(),
    bildirilenCekiciIds: [],
    teklifler: [],
  };

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const bildirilenIds = await notifyCekiciler(talep, baseUrl);
  talep.bildirilenCekiciIds = bildirilenIds;

  await addTalep(talep);
  await notifyMusteri(talep, "talep_alindi", baseUrl);

  return NextResponse.json({ id: talep.id, bildirilenSayisi: bildirilenIds.length });
}
