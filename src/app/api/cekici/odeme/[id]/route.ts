import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { garantiYapilandirildi } from "@/lib/garanti/config";
import { getBekleyenOdeme } from "@/lib/odeme";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const bekleyen = await getBekleyenOdeme(id);
  if (!bekleyen || bekleyen.cekiciId !== cekici.id) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({
    id: bekleyen.id,
    miktar: bekleyen.miktar,
    tutar: bekleyen.tutar,
    listeFiyati: bekleyen.listeFiyati,
    paketTl: bekleyen.paketTl,
    faturaEposta: bekleyen.faturaEposta,
    faturaAdres: bekleyen.faturaAdres,
    faturaTcKimlik: bekleyen.faturaTcKimlik,
    kurumsal: bekleyen.kurumsal,
    sirketUnvan: bekleyen.sirketUnvan,
    vergiNo: bekleyen.vergiNo,
    odemeTipi: bekleyen.odemeTipi ?? "kredi",
    garantiAktif: garantiYapilandirildi(),
  });
}
