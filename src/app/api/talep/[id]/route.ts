import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { aktifTeklifler, ihaleAcikMi } from "@/lib/ihale";

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

  const teklifler = aktifTeklifler(talep);
  const kazananSecildi = !!talep.kazananCekiciId;
  const anlasmaBekliyor =
    kazananSecildi && talep.durum === "kazanan_belli" && talep.anlasmaDurumu !== "anlaşıldı";
  const yenidenAranıyor = talep.durum === "yeniden_ihalede";
  const tamamlandi = talep.durum === "anlaşıldı";
  const ihaleAcik = ihaleAcikMi(talep);

  let cekiciAd: string | undefined;
  if (talep.kazananCekiciId) {
    const cekici = await getCekiciById(talep.kazananCekiciId);
    cekiciAd = cekici?.ad;
  }

  const kazananTeklif = talep.kazananTeklifId
    ? talep.teklifler?.find((t) => t.id === talep.kazananTeklifId)
    : undefined;

  return NextResponse.json({
    id: talep.id,
    durum: talep.durum,
    ihaleAcik,
    ihaleBitis: talep.ihaleBitis,
    teklifSayisi: teklifler.length,
    kazananSecildi,
    anlasmaBekliyor,
    yenidenAranıyor,
    tamamlandi,
    cekiciAd,
    kazananFiyat: kazananTeklif?.fiyat,
    anlasmaDurumu: talep.anlasmaDurumu,
    hedefKonum: talep.hedefKonum,
  });
}
