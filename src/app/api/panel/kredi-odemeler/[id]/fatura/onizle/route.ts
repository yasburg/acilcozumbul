import { NextResponse } from "next/server";
import { getKrediOdemeById } from "@/lib/kredi-odeme";
import { abonelikIslemIdFromDetay } from "@/lib/panel-satin-almalar";
import { ensureSeedData } from "@/lib/seed";
import { trendyolOdemeFaturaOnizle } from "@/lib/trendyol-efaturam/fatura-onizle";

/** Panel: yerel örnek PDF + özet (Trendyol’a henüz gönderilmez) */
export async function POST(
  request: Request,
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

  let faturaTarihi: string | undefined;
  try {
    const body = (await request.json()) as { faturaTarihi?: string };
    faturaTarihi =
      typeof body.faturaTarihi === "string" ? body.faturaTarihi : undefined;
  } catch {
    /* body yoksa varsayılan ödeme tarihi */
  }

  const sonuc = await trendyolOdemeFaturaOnizle(kayit, { faturaTarihi });
  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    onizleme: sonuc.onizleme,
  });
}
