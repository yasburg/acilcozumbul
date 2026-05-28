import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateCekici, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  TEKLIF_KREDI,
  cekiciHaricMi,
  cekiciTeklifVerebilirMi,
} from "@/lib/ihale";
import { talepBolge, talepSorunOzet } from "@/lib/talep-utils";
import type { Teklif } from "@/lib/types";

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
  const body = await request.json();
  const fiyat = Number(body.fiyat);
  const tahminiSureDk = Number(body.tahminiSureDk) || 30;
  const mesaj = body.mesaj?.trim();

  if (!fiyat || fiyat < 100) {
    return NextResponse.json(
      { error: "Geçerli bir fiyat girin (min. 100 TL)." },
      { status: 400 }
    );
  }

  let talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (cekiciHaricMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Müşteri sizi tercih etmedi.", tercihEdilmedi: true },
      { status: 403 }
    );
  }

  if (talep.kazananCekiciId === cekici.id) {
    return NextResponse.json({ kazandim: true, talepId: talep.id });
  }

  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    if (talep.kazananCekiciId) {
      return NextResponse.json(
        { error: "İhale kapandı. Müşteri teklif seçti." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Bu talebe artık teklif verilemez." },
      { status: 409 }
    );
  }

  if (cekici.kredi < TEKLIF_KREDI) {
    return NextResponse.json(
      { error: "Yetersiz kredi. Teklif için 1 kredi gerekir.", kredi: cekici.kredi },
      { status: 402 }
    );
  }

  talep = (await getTalepById(id))!;
  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Bu talebe az önce teklif verildi veya ihale kapandı." },
      { status: 409 }
    );
  }

  cekici.kredi -= TEKLIF_KREDI;

  const teklif: Teklif = {
    id: randomUUID(),
    cekiciId: cekici.id,
    cekiciAd: cekici.ad,
    fiyat,
    tahminiSureDk,
    mesaj,
    tarih: new Date().toISOString(),
    durum: "aktif",
  };

  talep.teklifler = [...(talep.teklifler ?? []), teklif];

  await updateCekici(cekici);
  await updateTalep(talep);

  return NextResponse.json({
    teklifId: teklif.id,
    kredi: cekici.kredi,
    mesaj: "Teklifiniz alındı. Kazanamazsanız krediniz iade edilir.",
    onizleme: {
      bolge: talepBolge(talep),
      sorunOzet: talepSorunOzet(talep.sorun),
    },
  });
}
