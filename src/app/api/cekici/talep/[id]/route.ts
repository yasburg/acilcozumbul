import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciHaricMi,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerdiMi,
  cekiciTeklifVerebilirMi,
  ihaleAcikMi,
  SMS_BILDIRIM_KREDI,
} from "@/lib/ihale";
import { koordinatGecerli } from "@/lib/koordinat";
import { talepBolge, talepSorunOzet } from "@/lib/talep-utils";
import type { Talep } from "@/lib/types";

/** Süre hesabı için koordinat (tam adres gönderilmez) */
function rotaKoordinatlari(talep: Talep) {
  return {
    konum: koordinatGecerli(talep.konum)
      ? { lat: talep.konum.lat, lng: talep.konum.lng }
      : undefined,
    hedefKonum:
      talep.hedefKonum && koordinatGecerli(talep.hedefKonum)
        ? { lat: talep.hedefKonum.lat, lng: talep.hedefKonum.lng }
        : undefined,
  };
}

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
      aracModeli: talep.aracModeli,
      fotografUrls: talep.fotografUrls,
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
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      teklifVerdim: true,
      ihaleAcik: ihaleAcikMi(talep),
      ihaleBitis: talep.ihaleBitis,
      benimTeklif: benimTeklifim,
      teklifSayisi: talep.teklifler?.filter((t) => t.durum === "aktif").length ?? 0,
      onizleme: {
        bolge: talepBolge(talep),
        sorunOzet: talepSorunOzet(talep.sorun),
        hedefBolge: talep.hedefKonum?.adres.split(",").slice(-2).join(",").trim(),
      },
      ...rotaKoordinatlari(talep),
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

  if (!cekiciTalebeBildirildiMi(talep, cekici.id)) {
    return NextResponse.json({
      id: talep.id,
      erisimYok: true,
      kredi: cekici.kredi,
      mesaj:
        cekici.kredi < SMS_BILDIRIM_KREDI
          ? "Krediniz yok. Yeni talep SMS'i ve panel listesi için kredi yükleyin (1 kredi = 1 bildirim)."
          : "Bu talep size SMS ile bildirilmedi.",
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
      aracModeli: talep.aracModeli,
    },
    fotografUrls: talep.fotografUrls,
    teklifUcretsiz: true,
    ...rotaKoordinatlari(talep),
    kredi: cekici.kredi,
  });
}
