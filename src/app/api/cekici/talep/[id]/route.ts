import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  baskaCekiciAktifMi,
  cekiciSatınAlabilirMi,
  cekiciTercihEdilmediMi,
  talepBolge,
  talepSorunOzet,
} from "@/lib/talep-utils";

export async function GET(
  _request: NextRequest,
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

  const benimMusterim = talep.satinAlanCekiciId === cekici.id;

  if (benimMusterim) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      satinAlindi: true,
      ad: talep.ad,
      soyad: talep.soyad,
      telefon: talep.telefon,
      konum: talep.konum,
      sorun: talep.sorun,
      olusturulma: talep.olusturulma,
    });
  }

  if (cekiciTercihEdilmediMi(talep, cekici.id)) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      satinAlindi: false,
      tercihEdilmedi: true,
      mesaj: "Müşteri sizi tercih etmedi.",
    });
  }

  if (baskaCekiciAktifMi(talep, cekici.id)) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      satinAlindi: false,
      baskaSatinAldi: true,
      mesaj: "Bu müşteri başka bir çekici tarafından satın alındı.",
    });
  }

  if (talep.durum === "anlaşıldı") {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      satinAlindi: false,
      baskaSatinAldi: true,
      mesaj: "Bu talep tamamlanmış.",
    });
  }

  if (!cekiciSatınAlabilirMi(talep, cekici.id)) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      satinAlindi: false,
      baskaSatinAldi: true,
      mesaj: "Bu talep şu an satın alınamaz.",
    });
  }

  return NextResponse.json({
    id: talep.id,
    durum: talep.durum,
    satinAlindi: false,
    baskaSatinAldi: false,
    onizleme: {
      bolge: talepBolge(talep),
      sorunOzet: talepSorunOzet(talep.sorun),
    },
    krediMaliyet: 1,
    kredi: cekici.kredi,
  });
}
