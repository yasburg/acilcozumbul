import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { refreshCekiciPuanOzet } from "@/lib/puan-ozet-db";
import {
  demoIslemTamamla,
  demoTalepGetir,
  isDemoTalepId,
} from "@/lib/demo-oturum";
import { dakikaYasi, marketplaceOlayKaydet } from "@/lib/marketplace-events";

/**
 * Kazanan çekici işi bitirdiğini işaretler → talep «anlaşıldı».
 */
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

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request, cekici.id);
    if (!demoCtx) {
      return NextResponse.json(
        { error: "Demo oturumu bulunamadı.", demoHatasi: true },
        { status: 404 }
      );
    }
    if (demoCtx.talep.kazananCekiciId !== cekici.id) {
      return NextResponse.json(
        { error: "Bu talep sizin kazandığınız iş değil." },
        { status: 403 }
      );
    }
    await demoIslemTamamla(demoCtx.oturum, id);
    return NextResponse.json({
      ok: true,
      durum: "anlaşıldı",
      mesaj: "İşlem tamamlandı.",
      demoModu: true,
    });
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (talep.kazananCekiciId !== cekici.id) {
    return NextResponse.json(
      { error: "Bu talep sizin kazandığınız iş değil." },
      { status: 403 }
    );
  }

  if (talep.durum !== "kazanan_belli" && talep.durum !== "anlaşıldı") {
    return NextResponse.json(
      { error: "Bu talep için işlem tamamlanamaz." },
      { status: 400 }
    );
  }

  if (talep.durum !== "anlaşıldı") {
    talep.durum = "anlaşıldı";
    talep.anlasmaDurumu = "anlaşıldı";
    talep.anlasildiAt = new Date().toISOString();
    await updateTalep(talep);
    await refreshCekiciPuanOzet(cekici.id).catch(() => {});
    await marketplaceOlayKaydet({ eventType: "job_completed", talepId: talep.id, cekiciId: cekici.id, eventKey: `job-completed:${talep.id}`, properties: { completion_time_min: dakikaYasi(talep.olusturulma) } });
  }

  return NextResponse.json({
    ok: true,
    durum: "anlaşıldı",
    mesaj: "İşlem tamamlandı.",
  });
}
