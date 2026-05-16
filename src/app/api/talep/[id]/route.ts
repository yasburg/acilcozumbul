import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

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

  const satinAlindi =
    talep.durum === "satın_alındı" && !!talep.satinAlanCekiciId;
  const anlasmaBekliyor = satinAlindi && talep.anlasmaDurumu !== "anlaşıldı";
  const yenidenAranıyor =
    talep.durum === "yeniden_aranıyor" || talep.durum === "beklemede";
  const tamamlandi = talep.durum === "anlaşıldı";

  let cekiciAd: string | undefined;
  if (talep.satinAlanCekiciId) {
    const cekici = await getCekiciById(talep.satinAlanCekiciId);
    cekiciAd = cekici?.ad;
  }

  return NextResponse.json({
    id: talep.id,
    durum: talep.durum,
    satinAlindi,
    anlasmaBekliyor,
    yenidenAranıyor: yenidenAranıyor && !satinAlindi,
    tamamlandi,
    cekiciAd,
    anlasmaDurumu: talep.anlasmaDurumu,
  });
}
