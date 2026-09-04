import { NextResponse } from "next/server";
import { getKrediOdemeById } from "@/lib/kredi-odeme";
import { abonelikIslemIdFromDetay } from "@/lib/panel-satin-almalar";
import { ensureSeedData } from "@/lib/seed";
import { trendyolOdemeFaturaOnizle } from "@/lib/trendyol-efaturam/fatura-onizle";

/** Panel: Trendyol faturayı kesmeden önce özet önizleme */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  if (abonelikIslemIdFromDetay(id)) {
    return NextResponse.json(
      { error: "Abonelik yenileme kayıtları için henüz desteklenmiyor." },
      { status: 400 }
    );
  }

  const kayit = await getKrediOdemeById(id);
  if (!kayit) {
    return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  }

  const sonuc = await trendyolOdemeFaturaOnizle(kayit);
  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    onizleme: sonuc.onizleme,
  });
}
