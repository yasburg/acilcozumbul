import { NextResponse } from "next/server";
import { getKrediOdemeById } from "@/lib/kredi-odeme";
import { odemeSonrasiTrendyolFatura } from "@/lib/fatura-trendyol";
import { abonelikIslemIdFromDetay } from "@/lib/panel-satin-almalar";
import { ensureSeedData } from "@/lib/seed";

/** Panel: Trendyol E-Faturam ile fatura oluştur */
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

  const sonuc = await odemeSonrasiTrendyolFatura(kayit, { manuel: true });
  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 502 });
  }
  if (sonuc.atlandi) {
    return NextResponse.json(
      {
        success: true,
        atlandi: true,
        neden: sonuc.neden,
        mesaj:
          sonuc.neden === "zaten_var"
            ? "Bu alım için fatura zaten mevcut."
            : "Trendyol fatura atlandı.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    success: true,
    belgeTipi: sonuc.belgeTipi,
    faturaId: sonuc.faturaId,
  });
}
