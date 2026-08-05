import { NextRequest, NextResponse } from "next/server";
import { getCekiciById } from "@/lib/db";
import { listeleFaturaLinkSon } from "@/lib/fatura-link-db";
import { panelFaturaYukleVeSms } from "@/lib/fatura-servis";
import { FATURA_PDF_MAX_BYTES } from "@/lib/fatura-storage";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const linkler = await listeleFaturaLinkSon(80);
  const faturalar = await Promise.all(
    linkler.map(async (f) => {
      const cekici = await getCekiciById(f.cekiciId);
      return {
        id: f.id,
        belgeNo: f.belgeNo,
        createdAt: f.createdAt,
        cekiciId: f.cekiciId,
        cekiciAd: cekici?.ad ?? "—",
        cekiciTelefon: cekici?.telefon ?? "—",
        krediOdemeId: f.krediOdemeId,
      };
    })
  );
  return NextResponse.json({ faturalar });
}

export async function POST(request: NextRequest) {
  await ensureSeedData();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz form verisi." },
      { status: 400 }
    );
  }

  const cekiciId = String(form.get("cekiciId") ?? "").trim();
  if (!cekiciId) {
    return NextResponse.json(
      { error: "Çekici seçin." },
      { status: 400 }
    );
  }

  const cekici = await getCekiciById(cekiciId);
  if (!cekici) {
    return NextResponse.json(
      { error: "Çekici bulunamadı." },
      { status: 404 }
    );
  }

  const dosya = form.get("pdf");
  if (!(dosya instanceof File)) {
    return NextResponse.json(
      { error: "PDF dosyası gerekli." },
      { status: 400 }
    );
  }
  if (dosya.size > FATURA_PDF_MAX_BYTES) {
    return NextResponse.json(
      { error: "PDF en fazla 5 MB olabilir." },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await dosya.arrayBuffer());
  const sonuc = await panelFaturaYukleVeSms({
    cekiciId,
    pdf: buf,
  });

  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    fatura: {
      id: sonuc.fatura.id,
      belgeNo: sonuc.fatura.belgeNo,
      createdAt: sonuc.fatura.createdAt,
      cekiciId: cekici.id,
      cekiciAd: cekici.ad,
      cekiciTelefon: cekici.telefon,
    },
    bildirimKanal: sonuc.bildirimKanal,
    emailGonderildi: sonuc.emailGonderildi,
    smsGonderildi: sonuc.smsGonderildi,
  });
}
