import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById, updateTalep } from "@/lib/db";
import { notifyCekiciIptal, notifyCekiciler, notifyMusteri } from "@/lib/sms";
import { ensureSeedData } from "@/lib/seed";

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

  if (talep.durum !== "satın_alındı" || !talep.satinAlanCekiciId) {
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
    await updateTalep(talep);
    await notifyMusteri(talep, "anlasildi", baseUrl);
    return NextResponse.json({ durum: "anlaşıldı", mesaj: "Anlaşma kaydedildi." });
  }

  const cekiciId = talep.satinAlanCekiciId;
  const cekici = await getCekiciById(cekiciId);

  const gecmis = talep.satinAlmaGecmisi ?? [];
  const sonKayit = [...gecmis].reverse().find((g) => g.cekiciId === cekiciId);
  if (sonKayit) sonKayit.tercihEdilmedi = true;
  else {
    gecmis.push({
      cekiciId,
      tarih: talep.satinAlmaTarihi ?? new Date().toISOString(),
      tercihEdilmedi: true,
    });
  }
  talep.satinAlmaGecmisi = gecmis;

  if (cekici) {
    await notifyCekiciIptal(cekici.telefon, cekici.id, talep);
  }

  const haric = [...(talep.haricTutulanCekiciIds ?? [])];
  if (!haric.includes(cekiciId)) haric.push(cekiciId);
  talep.haricTutulanCekiciIds = haric;

  talep.satinAlanCekiciId = undefined;
  talep.satinAlmaTarihi = undefined;
  talep.durum = "yeniden_aranıyor";
  talep.anlasmaDurumu = "bekliyor";

  const yeniBildirimler = await notifyCekiciler(talep, baseUrl, haric, {
    yenidenArama: true,
  });
  talep.bildirilenCekiciIds = [
    ...new Set([...talep.bildirilenCekiciIds, ...yeniBildirimler]),
  ];

  await updateTalep(talep);
  await notifyMusteri(talep, "yeniden_arama", baseUrl);

  return NextResponse.json({
    durum: "yeniden_aranıyor",
    mesaj: "Başka çekici aranıyor.",
    yenidenAranıyor: true,
  });
}
