import { NextRequest, NextResponse } from "next/server";
import { getTalepById } from "@/lib/db";
import {
  getDegerlendirmeByTalepId,
  kaydetMusteriDegerlendirme,
  memnuniyetDurumuHesapla,
  memnuniyetSmsGonderGerekirse,
} from "@/lib/memnuniyet";
import { ensureSeedData } from "@/lib/seed";
import { smsBaseUrl } from "@/lib/sms-base-url";

function baseUrlFrom(request: NextRequest): string {
  return smsBaseUrl(`${request.nextUrl.protocol}//${request.nextUrl.host}`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const degerlendirme = await getDegerlendirmeByTalepId(id);
  const durum = memnuniyetDurumuHesapla(talep, degerlendirme);

  if (durum.formAcik) {
    await memnuniyetSmsGonderGerekirse(talep, baseUrlFrom(request)).catch(
      () => {}
    );
  }

  return NextResponse.json({
    ...durum,
    cekiciId: talep.kazananCekiciId,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const body = await request.json();
  const puanGenel = Number(body.puanGenel ?? body.puan);
  const puanFiyat = Number(body.puanFiyat ?? body.puan);
  const puanSure = Number(body.puanSure ?? body.puan);
  const yorum = typeof body.yorum === "string" ? body.yorum : undefined;

  try {
    const kayit = await kaydetMusteriDegerlendirme(talep, {
      puanGenel,
      puanFiyat,
      puanSure,
      yorum,
    });
    return NextResponse.json({
      ok: true,
      puan: kayit.puan,
      mesaj: "Değerlendirmeniz için teşekkürler.",
    });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : e &&
            typeof e === "object" &&
            "message" in e &&
            typeof (e as { message: unknown }).message === "string"
          ? (e as { message: string }).message
          : "Kayıt başarısız.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
