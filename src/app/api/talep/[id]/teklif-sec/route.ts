import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { kaybedenTekliflereIade } from "@/lib/ihale";
import { notifyMusteri } from "@/lib/sms";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const { teklifId } = await request.json();

  if (!teklifId) {
    return NextResponse.json({ error: "Teklif seçin." }, { status: 400 });
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (talep.kazananCekiciId) {
    return NextResponse.json({ error: "Zaten bir çekici seçildi." }, { status: 409 });
  }

  const teklif = talep.teklifler?.find((t) => t.id === teklifId && t.durum === "aktif");
  if (!teklif) {
    return NextResponse.json({ error: "Geçersiz teklif." }, { status: 400 });
  }

  teklif.durum = "kazandi";
  talep.kazananCekiciId = teklif.cekiciId;
  talep.kazananTeklifId = teklif.id;
  talep.durum = "kazanan_belli";
  talep.anlasmaDurumu = "bekliyor";

  await kaybedenTekliflereIade(talep, teklif.id);

  const cekici = await getCekiciById(teklif.cekiciId);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  await notifyMusteri(talep, "cekici_bulundu", baseUrl);

  return NextResponse.json({
    cekiciAd: cekici?.ad ?? teklif.cekiciAd,
    fiyat: teklif.fiyat,
    mesaj: "Çekici seçildi. Kısa süre içinde sizi arayacak.",
  });
}
