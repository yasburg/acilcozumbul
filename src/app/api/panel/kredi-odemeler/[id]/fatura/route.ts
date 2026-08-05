import { NextRequest, NextResponse } from "next/server";
import { getAbonelikIslemById } from "@/lib/abonelik-db";
import { getCekiciById } from "@/lib/db";
import { getFaturaLinkByKrediOdemeId } from "@/lib/fatura-link-db";
import { panelFaturaYukleVeSms } from "@/lib/fatura-servis";
import { FATURA_PDF_MAX_BYTES } from "@/lib/fatura-storage";
import { getKrediOdemeById } from "@/lib/kredi-odeme";
import { abonelikIslemIdFromDetay } from "@/lib/panel-satin-almalar";
import { ensureSeedData } from "@/lib/seed";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz form verisi." },
      { status: 400 }
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

  const islemId = abonelikIslemIdFromDetay(id);
  let cekiciId: string;
  let krediOdemeId: string | null = null;
  let bildirimEposta: string | undefined;

  if (islemId) {
    const islem = await getAbonelikIslemById(islemId);
    if (!islem) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }
    cekiciId = islem.cekiciId;
    const cekici = await getCekiciById(cekiciId);
    bildirimEposta = cekici?.faturaEposta;
  } else {
    const kayit = await getKrediOdemeById(id);
    if (!kayit) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }
    const mevcut = await getFaturaLinkByKrediOdemeId(kayit.id);
    if (mevcut) {
      return NextResponse.json(
        { error: "Bu alım için fatura zaten yüklü." },
        { status: 409 }
      );
    }
    cekiciId = kayit.cekiciId;
    krediOdemeId = kayit.id;
    const cekici = await getCekiciById(cekiciId);
    bildirimEposta = kayit.faturaEposta || cekici?.faturaEposta;
  }

  const cekici = await getCekiciById(cekiciId);
  if (!cekici) {
    return NextResponse.json(
      { error: "Çekici bulunamadı." },
      { status: 404 }
    );
  }

  const buf = Buffer.from(await dosya.arrayBuffer());
  const sonuc = await panelFaturaYukleVeSms({
    cekiciId,
    pdf: buf,
    krediOdemeId,
    bildirimEposta,
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
    },
    bildirimKanal: sonuc.bildirimKanal,
    emailGonderildi: sonuc.emailGonderildi,
    smsGonderildi: sonuc.smsGonderildi,
  });
}
