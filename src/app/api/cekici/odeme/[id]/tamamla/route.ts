import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciEpostaDogrulandiMi } from "@/lib/cekici-email-otp";
import { getCekiciById, updateCekici } from "@/lib/db";
import { garantiYapilandirildi } from "@/lib/garanti/config";
import { garantiKrediOdemesiYap } from "@/lib/garanti/payment";
import { istemciIpAl } from "@/lib/istemci-ip";
import { kaydetKrediOdeme } from "@/lib/kredi-odeme";
import { tlTutarKurus } from "@/lib/kredi-fiyat";
import { faturaAlanlariniDogrula } from "@/lib/odeme-fatura";
import {
  getBekleyenOdeme,
  guncelleBekleyenOdemeFatura,
  tamamlaOdeme,
} from "@/lib/odeme";
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
  let bekleyen = await getBekleyenOdeme(id);

  if (!bekleyen || bekleyen.cekiciId !== cekici.id) {
    return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const faturaSonuc = faturaAlanlariniDogrula({
    faturaEposta: body.faturaEposta ?? bekleyen.faturaEposta,
    faturaAdres: body.faturaAdres,
    faturaTcKimlik: body.faturaTcKimlik,
    kurumsal: body.kurumsal,
    sirketUnvan: body.sirketUnvan,
    vergiNo: body.vergiNo,
  });

  if (!faturaSonuc.ok) {
    return NextResponse.json({ error: faturaSonuc.hata }, { status: 400 });
  }

  if (!(await cekiciEpostaDogrulandiMi(cekici.id, faturaSonuc.data.faturaEposta))) {
    return NextResponse.json(
      { error: "Fatura e-postası doğrulanmamış." },
      { status: 403 }
    );
  }

  bekleyen =
    (await guncelleBekleyenOdemeFatura(id, cekici.id, faturaSonuc.data)) ??
    bekleyen;

  const { kartNo, sonKullanma, cvv } = body as {
    kartNo?: string;
    sonKullanma?: string;
    cvv?: string;
  };

  let referans = `VPOS-${id.slice(0, 8).toUpperCase()}`;
  let garantiRespCode: string | undefined;
  const demo = !garantiYapilandirildi();

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

    const sonuc = await garantiKrediOdemesiYap({
      orderId: id,
      amountKurus: tlTutarKurus(bekleyen.tutar),
      cardNumber: String(kartNo),
      expiryMonth: sk.ay,
      expiryYear: sk.yil,
      cvv: String(cvv),
      clientIp: istemciIpAl(request),
      email: faturaSonuc.data.faturaEposta,
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
    garantiRespCode = sonuc.respCode;
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

  await kaydetKrediOdeme({
    id: bekleyen.id,
    cekiciId: cekici.id,
    cekiciAd: guncelCekici.ad,
    cekiciTelefon: guncelCekici.telefon,
    miktar: bekleyen.miktar,
    tutar: bekleyen.tutar,
    listeFiyati: bekleyen.listeFiyati,
    paketTl: bekleyen.paketTl ?? bekleyen.listeFiyati ?? bekleyen.tutar,
    faturaEposta: faturaSonuc.data.faturaEposta,
    faturaAdres: faturaSonuc.data.faturaAdres,
    faturaTcKimlik: faturaSonuc.data.faturaTcKimlik,
    kurumsal: faturaSonuc.data.kurumsal,
    sirketUnvan: faturaSonuc.data.sirketUnvan,
    vergiNo: faturaSonuc.data.vergiNo,
    odemeReferans: referans,
    garantiRespCode,
    demoOdeme: demo,
    olusturulma: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    eklenenKredi: bekleyen.miktar,
    toplamKredi: guncelCekici.kredi,
    referans,
    demo,
  });
}
