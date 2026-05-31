import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById, updateTalep } from "@/lib/db";
import { notifyCekiciIptal, notifyCekiciler, notifyMusteri } from "@/lib/sms";
import { ensureSeedData } from "@/lib/seed";
import { IHALE_SURE_DK } from "@/lib/ihale";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const { sonuc } = await request.json();

  if (sonuc !== "anlasti" && sonuc !== "anlasamadi") {
    return NextResponse.json({ error: "Geçersiz seçim." }, { status: 400 });
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (talep.durum !== "kazanan_belli" || !talep.kazananCekiciId) {
    return NextResponse.json(
      { error: "Bu talep için anlaşma bildirimi yapılamaz." },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  if (sonuc === "anlasti") {
    talep.durum = "anlaşıldı";
    talep.anlasmaDurumu = "anlaşıldı";
    talep.anlasildiAt = new Date().toISOString();
    await updateTalep(talep);
    await notifyMusteri(talep, "anlasildi", baseUrl);
    return NextResponse.json({ durum: "anlaşıldı", mesaj: "Anlaşma kaydedildi." });
  }

  const cekiciId = talep.kazananCekiciId;
  const cekici = await getCekiciById(cekiciId);

  if (cekici) {
    await notifyCekiciIptal(cekici.telefon, cekici.id, talep);
  }

  const haric = [...(talep.haricTutulanCekiciIds ?? [])];
  if (!haric.includes(cekiciId)) haric.push(cekiciId);
  talep.haricTutulanCekiciIds = haric;

  talep.kazananCekiciId = undefined;
  talep.kazananTeklifId = undefined;
  talep.teklifler = [];
  talep.durum = "yeniden_ihalede";
  talep.anlasmaDurumu = "bekliyor";
  const simdi = new Date();
  talep.ihaleBitis = new Date(simdi.getTime() + IHALE_SURE_DK * 60 * 1000).toISOString();

  const yeniBildirimler = await notifyCekiciler(talep, baseUrl, haric, {
    yenidenArama: true,
  });
  talep.bildirilenCekiciIds = [
    ...new Set([...talep.bildirilenCekiciIds, ...yeniBildirimler]),
  ];

  await updateTalep(talep);
  await notifyMusteri(talep, "yeniden_arama", baseUrl);

  return NextResponse.json({
    durum: "yeniden_ihalede",
    mesaj: "İhale yeniden açıldı. Çekiciler teklif verebilir.",
    yenidenAranıyor: true,
  });
}
