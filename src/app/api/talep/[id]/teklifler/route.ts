import { NextRequest, NextResponse } from "next/server";
import { getTalepById } from "@/lib/db";
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

  const teklifler = aktifTeklifler(talep).map((t) => ({
    id: t.id,
    cekiciAd: t.cekiciAd.split(" ")[0] + " " + (t.cekiciAd.split(" ")[1]?.charAt(0) ?? "") + ".",
    fiyat: t.fiyat,
    tahminiSureDk: t.tahminiSureDk,
    mesaj: t.mesaj,
    tarih: t.tarih,
  }));

  return NextResponse.json({
    teklifler,
    teklifSayisi: teklifler.length,
    ihaleAcik: ihaleAcikMi(talep),
    ihaleBitis: talep.ihaleBitis,
    kazananSecildi: !!talep.kazananCekiciId,
    durum: talep.durum,
    hedefKonum: talep.hedefKonum,
  });
}
