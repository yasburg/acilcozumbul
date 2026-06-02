import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateCekici, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciAcikTalepUygunMu,
  cekiciTalebeBildirildiMi,
  SMS_BILDIRIM_KREDI,
} from "@/lib/ihale";

/** 1 kredi ile ihaleye katıl (panelde gizli talebi aç) */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (!cekiciAcikTalepUygunMu(talep, cekici)) {
    return NextResponse.json(
      { error: "Bu talebe katılım açık değil." },
      { status: 409 }
    );
  }

  if (cekiciTalebeBildirildiMi(talep, cekici.id)) {
    return NextResponse.json({ success: true, zatenAcik: true });
  }

  if (cekici.kredi < SMS_BILDIRIM_KREDI) {
    return NextResponse.json(
      {
        error: "İhaleye katılmak için en az 1 kredi gerekir.",
        yetersizKredi: true,
        mevcutKredi: cekici.kredi,
      },
      { status: 402 }
    );
  }

  cekici.kredi -= SMS_BILDIRIM_KREDI;
  await updateCekici(cekici);

  talep.bildirilenCekiciIds = [
    ...new Set([...(talep.bildirilenCekiciIds ?? []), cekici.id]),
  ];
  await updateTalep(talep);

  return NextResponse.json({
    success: true,
    kredi: cekici.kredi,
    harcananKredi: SMS_BILDIRIM_KREDI,
    mesaj: "İhaleye katıldınız. Teklif verebilirsiniz.",
  });
}
