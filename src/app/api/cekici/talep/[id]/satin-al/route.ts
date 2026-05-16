import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateCekici, updateTalep } from "@/lib/db";
import { notifyMusteri } from "@/lib/sms";
import { ensureSeedData } from "@/lib/seed";
import {
  baskaCekiciAktifMi,
  cekiciHaricMi,
  cekiciSatınAlabilirMi,
} from "@/lib/talep-utils";

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
  let talep = await getTalepById(id);

  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (cekiciHaricMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Müşteri sizi tercih etmedi.", tercihEdilmedi: true },
      { status: 403 }
    );
  }

  if (talep.satinAlanCekiciId === cekici.id) {
    return NextResponse.json({
      ad: talep.ad,
      soyad: talep.soyad,
      telefon: talep.telefon,
      konum: talep.konum,
      sorun: talep.sorun,
    });
  }

  if (baskaCekiciAktifMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Bu müşteri başka bir çekici tarafından satın alındı." },
      { status: 409 }
    );
  }

  if (!cekiciSatınAlabilirMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Bu talep artık satın alınamaz." },
      { status: 409 }
    );
  }

  if (cekici.kredi < 1) {
    return NextResponse.json(
      { error: "Yetersiz kredi. Lütfen kredi satın alın.", kredi: cekici.kredi },
      { status: 402 }
    );
  }

  // Yarış durumuna karşı tekrar oku
  talep = (await getTalepById(id))!;
  if (baskaCekiciAktifMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Bu müşteri az önce başka bir çekici tarafından alındı." },
      { status: 409 }
    );
  }

  cekici.kredi -= 1;
  talep.satinAlanCekiciId = cekici.id;
  talep.durum = "satın_alındı";
  talep.satinAlmaTarihi = new Date().toISOString();
  talep.anlasmaDurumu = "bekliyor";
  talep.satinAlmaGecmisi = [
    ...(talep.satinAlmaGecmisi ?? []),
    { cekiciId: cekici.id, tarih: talep.satinAlmaTarihi },
  ];

  await updateCekici(cekici);
  await updateTalep(talep);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  await notifyMusteri(talep, "cekici_bulundu", baseUrl);

  return NextResponse.json({
    ad: talep.ad,
    soyad: talep.soyad,
    telefon: talep.telefon,
    konum: talep.konum,
    sorun: talep.sorun,
    kredi: cekici.kredi,
    musteriAlindi: true,
    talepId: talep.id,
  });
}
