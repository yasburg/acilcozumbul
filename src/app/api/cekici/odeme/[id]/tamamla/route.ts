import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getCekiciById, updateCekici } from "@/lib/db";
import { getBekleyenOdeme, tamamlaOdeme } from "@/lib/odeme";
import { ensureSeedData } from "@/lib/seed";

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
  const bekleyen = await getBekleyenOdeme(id);

  if (!bekleyen || bekleyen.cekiciId !== cekici.id) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  await new Promise((r) => setTimeout(r, 600));

  const guncelCekici = await getCekiciById(cekici.id);
  if (!guncelCekici) {
    return NextResponse.json({ error: "Çekici bulunamadı." }, { status: 404 });
  }

  guncelCekici.kredi += bekleyen.miktar;
  await updateCekici(guncelCekici);
  await tamamlaOdeme(id);

  return NextResponse.json({
    success: true,
    eklenenKredi: bekleyen.miktar,
    toplamKredi: guncelCekici.kredi,
    referans: `VPOS-${id.slice(0, 8).toUpperCase()}`,
  });
}
