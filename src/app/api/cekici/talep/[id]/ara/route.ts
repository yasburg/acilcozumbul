import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  demoMusteriAra,
  demoTalepGetir,
  isDemoTalepId,
} from "@/lib/demo-oturum";

/**
 * Kazanan çekici «Müşteriye ara» tıkladı → ilk arama zamanını kaydet.
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
    if (!demoCtx || demoCtx.talep.kazananCekiciId !== cekici.id) {
      return NextResponse.json(
        { error: "Bu talep sizin kazandığınız iş değil." },
        { status: 403 }
      );
    }
    const guncel = await demoMusteriAra(demoCtx.oturum, id);
    return NextResponse.json({
      ok: true,
      musteriArandiAt: guncel.musteriArandiAt,
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

  if (!talep.musteriArandiAt) {
    talep.musteriArandiAt = new Date().toISOString();
    await updateTalep(talep);
  }

  return NextResponse.json({
    ok: true,
    musteriArandiAt: talep.musteriArandiAt,
  });
}
