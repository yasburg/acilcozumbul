import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciBildirimKrediTutari,
  cekiciHaricMi,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerdiMi,
  cekiciTeklifVerebilirMi,
  cekiciYeterliBildirimKredisi,
  ihaleAcikMi,
} from "@/lib/ihale";
import { koordinatGecerli } from "@/lib/koordinat";
import { talepBolge, talepSorunOzet } from "@/lib/talep-utils";
import type { Talep } from "@/lib/types";
import { demoTalepGetir, isDemoTalepId } from "@/lib/demo-oturum";
import { demoCekiciTalepGetJson } from "@/lib/demo-responses";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";
import {
  sehirBeklemeMesaji,
} from "@/lib/cekici-sehir-acilis";
import { sehirKullanimAcikMiDb } from "@/lib/cekici-sehir-acilis-db";

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await sehirKullanimAcikMiDb(cekici.sehir))) {
    return NextResponse.json(
      {
        error: sehirBeklemeMesaji(cekici.sehir),
        sehirBeklemede: true,
      },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request, cekici.id);
    if (!demoCtx) {
      return NextResponse.json(
        {
          error:
            "Demo oturumu bulunamadı veya bu talep artık geçerli değil. Panelden demo yeniden başlatın.",
          demoHatasi: true,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(
      demoCekiciTalepGetJson(demoCtx.talep, cekici)
    );
  }

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
      musteriArandiAt: talep.musteriArandiAt,
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
      kredi: cekiciToplamKredi(cekici),
      onayliCekici: Boolean(cekici.rozetAktif),
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
    const tutar = cekiciBildirimKrediTutari(cekici);
    const toplam = cekiciToplamKredi(cekici);
    return NextResponse.json({
      id: talep.id,
      erisimYok: true,
      kredi: toplam,
      mesaj: !cekiciYeterliBildirimKredisi(toplam, tutar)
        ? `Krediniz yetersiz. Bildirim için en az ${tutar} kredi gerekir.`
        : `Bu talep henüz size açılmadı. Müşteriler sekmesinden ${tutar} kredi ile katılabilirsiniz.`,
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
    kredi: cekiciToplamKredi(cekici),
    onayliCekici: Boolean(cekici.rozetAktif),
  });
}
