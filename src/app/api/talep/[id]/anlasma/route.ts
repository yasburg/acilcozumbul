import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById, updateTalep } from "@/lib/db";
import { notifyCekiciIptal, notifyCekiciler, notifyMusteri } from "@/lib/sms";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { ensureSeedData } from "@/lib/seed";
import { anlasamadiSonrasiIhaleyiSurdur } from "@/lib/ihale";
import { refreshCekiciPuanOzet } from "@/lib/puan-ozet-db";

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

  const baseUrl = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );

  if (sonuc === "anlasti") {
    talep.durum = "anlaşıldı";
    talep.anlasmaDurumu = "anlaşıldı";
    talep.anlasildiAt = new Date().toISOString();
    await updateTalep(talep);
    if (talep.kazananCekiciId) {
      await refreshCekiciPuanOzet(talep.kazananCekiciId).catch(() => {});
    }
    return NextResponse.json({ durum: "anlaşıldı", mesaj: "Anlaşma kaydedildi." });
  }

  const cekiciId = talep.kazananCekiciId;
  const cekici = await getCekiciById(cekiciId);

  if (cekici) {
    await notifyCekiciIptal(cekici.telefon, cekici.id, talep);
  }

  const { kalanAktif } = anlasamadiSonrasiIhaleyiSurdur(talep, cekiciId);
  const haric = talep.haricTutulanCekiciIds ?? [];

  if (kalanAktif === 0) {
    const yeniBildirimler = await notifyCekiciler(talep, baseUrl, haric, {
      yenidenArama: true,
    });
    talep.bildirilenCekiciIds = [
      ...new Set([...talep.bildirilenCekiciIds, ...yeniBildirimler]),
    ];
    await notifyMusteri(talep, "yeniden_arama", baseUrl);
  }

  await updateTalep(talep);

  if (kalanAktif > 0) {
    return NextResponse.json({
      durum: talep.durum,
      mesaj:
        "Önceki çekici ile anlaşılamadı. Diğer tekliflerden seçim yapabilirsiniz.",
      tekliflereDon: true,
      kalanTeklifSayisi: kalanAktif,
      yenidenAranıyor: false,
    });
  }

  return NextResponse.json({
    durum: "yeniden_ihalede",
    mesaj: "Başka teklif kalmadı. İhale yeniden açıldı.",
    tekliflereDon: false,
    kalanTeklifSayisi: 0,
    yenidenAranıyor: true,
  });
}
