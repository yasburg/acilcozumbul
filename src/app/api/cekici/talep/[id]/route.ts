import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciHaricMi,
  cekiciTeklifVerdiMi,
  cekiciTeklifVerebilirMi,
  ihaleAcikMi,
} from "@/lib/ihale";
import { talepBolge, talepSorunOzet } from "@/lib/talep-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const talep = await getTalepById(id);

  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const benimMusterim = talep.kazananCekiciId === cekici.id;
  const teklifVerdim = cekiciTeklifVerdiMi(talep, cekici.id);
  const benimTeklifim = talep.teklifler?.find((t) => t.cekiciId === cekici.id);

  if (benimMusterim) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      kazandim: true,
      ad: talep.ad,
      soyad: talep.soyad,
      telefon: talep.telefon,
      konum: talep.konum,
      hedefKonum: talep.hedefKonum,
      sorun: talep.sorun,
      olusturulma: talep.olusturulma,
      benimTeklif: benimTeklifim,
    });
  }

  if (cekiciHaricMi(talep, cekici.id)) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      tercihEdilmedi: true,
      mesaj: "Müşteri sizi tercih etmedi.",
    });
  }

  if (talep.kazananCekiciId && talep.kazananCekiciId !== cekici.id) {
    const kaybettim = teklifVerdim;
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      ihaleKapandi: true,
      kaybettim,
      mesaj: kaybettim
        ? "Başka bir çekici seçildi."
        : "Müşteri başka bir çekiciyi seçti.",
    });
  }

  if (talep.durum === "anlaşıldı") {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      ihaleKapandi: true,
      mesaj: "Bu talep tamamlanmış.",
    });
  }

  if (teklifVerdim && benimTeklifim) {
    const ilkFiyat = benimTeklifim.ilkFiyat ?? benimTeklifim.fiyat;
    const fiyatDegisti =
      benimTeklifim.fiyatDegisti === true ||
      benimTeklifim.fiyat !== ilkFiyat;
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      teklifVerdim: true,
      ihaleAcik: ihaleAcikMi(talep),
      ihaleBitis: talep.ihaleBitis,
      benimTeklif: {
        ...benimTeklifim,
        ilkFiyat,
        fiyatDegisti,
      },
      fiyatDegisti,
      fiyatDegistiUyari: fiyatDegisti
        ? `Fiyatı ${ilkFiyat} TL'den ${benimTeklifim.fiyat} TL'ye değiştirdiniz. Müşteri bu teklifle sizi seçemez.`
        : undefined,
      teklifSayisi: talep.teklifler?.filter((t) => t.durum === "aktif").length ?? 0,
      onizleme: {
        bolge: talepBolge(talep),
        sorunOzet: talepSorunOzet(talep.sorun),
        hedefBolge: talep.hedefKonum?.adres.split(",").slice(-2).join(",").trim(),
      },
      kredi: cekici.kredi,
    });
  }

  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      ihaleKapandi: true,
      mesaj: "Bu talebe artık teklif verilemez.",
    });
  }

  return NextResponse.json({
    id: talep.id,
    durum: talep.durum,
    ihaleAcik: true,
    ihaleBitis: talep.ihaleBitis,
    onizleme: {
      bolge: talepBolge(talep),
      sorunOzet: talepSorunOzet(talep.sorun),
      hedefBolge: talep.hedefKonum?.adres.split(",").slice(-2).join(",").trim(),
    },
    teklifUcretsiz: true,
    kredi: cekici.kredi,
  });
}
