import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getCekiciById, updateCekici } from "@/lib/db";
import { garantiYapilandirildi } from "@/lib/garanti/config";
import { garantiKrediOdemesiYap } from "@/lib/garanti/payment";
import { istemciIpAl } from "@/lib/istemci-ip";
import { tlTutarKurus } from "@/lib/kredi-fiyat";
import { getBekleyenOdeme, tamamlaOdeme } from "@/lib/odeme";
import { ensureSeedData } from "@/lib/seed";

function sonKullanmaAyir(sonKullanma: string): { ay: string; yil: string } | null {
  const temiz = sonKullanma.replace(/\s/g, "");
  const slash = temiz.match(/^(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    return { ay: slash[1], yil: slash[2].slice(-2) };
  }
  const digits = temiz.replace(/\D/g, "");
  if (digits.length >= 4) {
    return { ay: digits.slice(0, 2), yil: digits.slice(-2) };
  }
  return null;
}

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
  const bekleyen = await getBekleyenOdeme(id);

  if (!bekleyen || bekleyen.cekiciId !== cekici.id) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { kartNo, sonKullanma, cvv } = body as {
    kartNo?: string;
    sonKullanma?: string;
    cvv?: string;
  };

  let referans = `VPOS-${id.slice(0, 8).toUpperCase()}`;

  if (garantiYapilandirildi()) {
    if (!kartNo || !sonKullanma || !cvv) {
      return NextResponse.json(
        { error: "Kart bilgilerini doldurun." },
        { status: 400 }
      );
    }
    const sk = sonKullanmaAyir(String(sonKullanma));
    if (!sk) {
      return NextResponse.json(
        { error: "Son kullanma tarihi geçersiz (AA/YY)." },
        { status: 400 }
      );
    }

    const beklenenKurus = tlTutarKurus(bekleyen.tutar);
    const sonuc = await garantiKrediOdemesiYap({
      orderId: id,
      amountKurus: beklenenKurus,
      cardNumber: String(kartNo),
      expiryMonth: sk.ay,
      expiryYear: sk.yil,
      cvv: String(cvv),
      clientIp: istemciIpAl(request),
    });

    if (!sonuc.basarili) {
      return NextResponse.json(
        {
          error: sonuc.message || "Ödeme banka tarafından reddedildi.",
          code: sonuc.respCode,
        },
        { status: 400 }
      );
    }
    referans = sonuc.refNo ?? referans;
  } else {
    await new Promise((r) => setTimeout(r, 600));
  }

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
    referans,
    demo: !garantiYapilandirildi(),
  });
}
