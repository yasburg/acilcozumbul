import { NextResponse } from "next/server";
import { getTalepById, updateTalep } from "@/lib/db";
import {
  demoMusteriWhatsapp,
  demoTalepGetir,
  isDemoTalepId,
} from "@/lib/demo-oturum";
import { ensureSeedData } from "@/lib/seed";

/** Müşteri «WhatsApp'tan konum at» tıkladı */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request);
    if (!demoCtx?.talep.kazananCekiciId) {
      return NextResponse.json(
        { error: "Kazanan çekici seçilmeden WhatsApp kaydı yapılamaz." },
        { status: 400 }
      );
    }
    const guncel = await demoMusteriWhatsapp(demoCtx.oturum, id);
    return NextResponse.json({
      ok: true,
      musteriWhatsappAt: guncel.musteriWhatsappAt,
      demoModu: true,
    });
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (!talep.kazananCekiciId) {
    return NextResponse.json(
      { error: "Kazanan çekici seçilmeden WhatsApp kaydı yapılamaz." },
      { status: 400 }
    );
  }

  if (!talep.musteriWhatsappAt) {
    talep.musteriWhatsappAt = new Date().toISOString();
    await updateTalep(talep);
  }

  return NextResponse.json({
    ok: true,
    musteriWhatsappAt: talep.musteriWhatsappAt,
  });
}
