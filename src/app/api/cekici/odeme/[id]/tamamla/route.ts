import { NextRequest, NextResponse } from "next/server";
import {
  kaydetAbonelikIslem,
  olusturCekiciAbonelik,
} from "@/lib/abonelik-db";
import { getCurrentCekici } from "@/lib/auth";
import { getCekiciById, updateCekici } from "@/lib/db";
import { garantiYapilandirildi, odemeDemoMu } from "@/lib/garanti/config";
import {
  aylikRecurringOpts,
  garantiKrediOdemesiYap,
  orderIdTemizle,
} from "@/lib/garanti/payment";
import { istemciIpAl } from "@/lib/istemci-ip";
import { baglaKrediHatirlatmaYukleme } from "@/lib/kredi-hatirlatma-db";
import { kaydetKrediOdeme } from "@/lib/kredi-odeme";
import { tlTutarKurus } from "@/lib/kredi-fiyat";
import { faturaAlanlariniDogrula } from "@/lib/odeme-fatura";
import {
  getBekleyenOdeme,
  guncelleBekleyenOdemeFatura,
  tamamlaOdeme,
} from "@/lib/odeme";
import {
  abonelikKrediSifirlaVeYukle,
  cekiciToplamKredi,
} from "@/lib/kredi-bakiye";
import { ensureSeedData } from "@/lib/seed";
import { adminOdemeSmsGonder } from "@/lib/admin-odeme-sms";
import { kurumsalOdemeSonrasiTrendyolFatura } from "@/lib/fatura-trendyol";

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
  const demo = odemeDemoMu();

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

    const clientIp = istemciIpAl(request);
    const sonuc = await garantiKrediOdemesiYap({
      orderId: id,
      amountKurus: tlTutarKurus(bekleyen.tutar),
      cardNumber: String(kartNo),
      expiryMonth: sk.ay,
      expiryYear: sk.yil,
      cvv: String(cvv),
      clientIp,
      email: faturaSonuc.data.faturaEposta || undefined,
      recurring:
        bekleyen.odemeTipi === "abonelik" ? aylikRecurringOpts() : undefined,
    });

    if (!sonuc.basarili) {
      return NextResponse.json(
        {
          error:
            sonuc.message ||
            "Ödeme banka tarafından reddedildi. Lütfen kart bilgilerinizi kontrol edin veya farklı bir kart deneyin.",
          code: sonuc.respCode,
          bankaMesaji: sonuc.bankaMesaji,
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

  if (bekleyen.odemeTipi === "rozet") {
    guncelCekici.rozetAktif = true;
    guncelCekici.rozetOdemeTarihi = new Date().toISOString();
    await updateCekici(guncelCekici);
    await tamamlaOdeme(id);

    const krediOdemeKayit = {
      id: bekleyen.id,
      cekiciId: cekici.id,
      cekiciAd: guncelCekici.ad,
      cekiciTelefon: guncelCekici.telefon,
      miktar: 0,
      tutar: bekleyen.tutar,
      listeFiyati: bekleyen.listeFiyati,
      paketTl: bekleyen.paketTl ?? bekleyen.listeFiyati ?? bekleyen.tutar,
      odemeTipi: "rozet" as const,
      faturaEposta: faturaSonuc.data.faturaEposta ?? "",
      faturaAdres: faturaSonuc.data.faturaAdres,
      faturaTcKimlik: faturaSonuc.data.faturaTcKimlik,
      kurumsal: faturaSonuc.data.kurumsal,
      sirketUnvan: faturaSonuc.data.sirketUnvan,
      vergiNo: faturaSonuc.data.vergiNo,
      odemeReferans: referans,
      garantiRespCode,
      demoOdeme: demo,
      olusturulma: new Date().toISOString(),
    };

    await kaydetKrediOdeme(krediOdemeKayit);

    void kurumsalOdemeSonrasiTrendyolFatura(krediOdemeKayit).catch((e) =>
      console.error("[trendyol-fatura] rozet tamamla", e)
    );

    void adminOdemeSmsGonder({
      tip: "rozet",
      tutarTl: bekleyen.tutar,
      cekiciAd: guncelCekici.ad,
    });

    return NextResponse.json({
      success: true,
      rozetAktif: true,
      odemeTipi: "rozet",
      referans,
      demo,
    });
  }

  if (bekleyen.odemeTipi === "abonelik") {
    abonelikKrediSifirlaVeYukle(guncelCekici, bekleyen.miktar);
  } else {
    guncelCekici.kredi += bekleyen.miktar;
  }
  await updateCekici(guncelCekici);
  await tamamlaOdeme(id);

  let abonelikId: string | undefined;
  if (bekleyen.odemeTipi === "abonelik") {
    const orderId = orderIdTemizle(id);
    const abonelik = await olusturCekiciAbonelik({
      cekiciId: cekici.id,
      paketTl: bekleyen.paketTl ?? bekleyen.tutar,
      garantiOrderId: orderId,
      garantiOriginalRetrefNum: referans.startsWith("VPOS-")
        ? undefined
        : referans,
      garantiClientIp: istemciIpAl(request),
    });
    abonelikId = abonelik.id;
    await kaydetAbonelikIslem({
      abonelikId: abonelik.id,
      cekiciId: cekici.id,
      tip: "created",
      tutarTl: bekleyen.tutar,
      kredi: bekleyen.miktar,
      garantiOrderId: orderId,
      eventId: `created_${orderId}`,
    });
  }

  const krediOdemeKayit = {
    id: bekleyen.id,
    cekiciId: cekici.id,
    cekiciAd: guncelCekici.ad,
    cekiciTelefon: guncelCekici.telefon,
    miktar: bekleyen.miktar,
    tutar: bekleyen.tutar,
    listeFiyati: bekleyen.listeFiyati,
    paketTl: bekleyen.paketTl ?? bekleyen.listeFiyati ?? bekleyen.tutar,
    odemeTipi:
      (bekleyen.odemeTipi === "abonelik" ? "abonelik" : "kredi") as
        | "kredi"
        | "abonelik",
    faturaEposta: faturaSonuc.data.faturaEposta ?? "",
    faturaAdres: faturaSonuc.data.faturaAdres,
    faturaTcKimlik: faturaSonuc.data.faturaTcKimlik,
    kurumsal: faturaSonuc.data.kurumsal,
    sirketUnvan: faturaSonuc.data.sirketUnvan,
    vergiNo: faturaSonuc.data.vergiNo,
    odemeReferans: referans,
    garantiRespCode,
    demoOdeme: demo,
    olusturulma: new Date().toISOString(),
  };

  await kaydetKrediOdeme(krediOdemeKayit);

  if (faturaSonuc.data.kurumsal) {
    void kurumsalOdemeSonrasiTrendyolFatura(krediOdemeKayit).catch((e) =>
      console.error("[trendyol-fatura] tamamla", e)
    );
  }

  try {
    await baglaKrediHatirlatmaYukleme(cekici.id);
  } catch (e) {
    console.error("[kredi-hatirlatma] yukleme bagla", e);
  }

  void adminOdemeSmsGonder({
    tip: bekleyen.odemeTipi === "abonelik" ? "abonelik" : "kredi",
    tutarTl: bekleyen.tutar,
    cekiciAd: guncelCekici.ad,
  });

  return NextResponse.json({
    success: true,
    odemeTipi: bekleyen.odemeTipi === "abonelik" ? "abonelik" : "kredi",
    eklenenKredi: bekleyen.miktar,
    toplamKredi: cekiciToplamKredi(guncelCekici),
    abonelikKredi: guncelCekici.abonelikKredi ?? 0,
    satinAlinanKredi: guncelCekici.kredi,
    abonelikId,
    referans,
    demo,
  });
}
