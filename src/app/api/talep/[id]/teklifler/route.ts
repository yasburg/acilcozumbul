import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { teklifleriSirala } from "@/lib/teklif-siralama";
import { cekiciPuanOzetleri, teklifFiyatDegistiMi } from "@/lib/cekici-puan";
import { ensureSeedData } from "@/lib/seed";
import { aktifTeklifler, ihaleAcikMi } from "@/lib/ihale";
import { demoTalepGetir, isDemoTalepId } from "@/lib/demo-oturum";
import { demoMusteriTekliflerJson } from "@/lib/demo-responses";
import { musteriGosterimSureDk } from "@/lib/sorun-tipleri";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request);
    if (!demoCtx) {
      return NextResponse.json(
        { error: "Demo oturumu bulunamadı.", demoHatasi: true },
        { status: 404 }
      );
    }
    return NextResponse.json(demoMusteriTekliflerJson(demoCtx.talep));
  }

  const talep = await getTalepById(id);

  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const aktif = aktifTeklifler(talep);
  const puanMap = await cekiciPuanOzetleri(aktif.map((t) => t.cekiciId));
  const rozetCache = new Map<string, boolean>();

  const tekliflerHam = await Promise.all(
    aktif.map(async (t) => {
      const puan =
        puanMap.get(t.cekiciId) ??
        ({
          gorunurTercihPuani: null,
          tercihPuani: null,
          tercihYuzde: null,
          hizmetPuani: null,
          hizmetDegerlendirmeAdet: 0,
          fiyatGarantiPuani: 5,
          fiyatGarantiYuzde: 100,
        } as const);
      const fiyatDegisti = teklifFiyatDegistiMi(t);
      const ilkFiyat = t.ilkFiyat ?? t.fiyat;

      let onayliCekici = rozetCache.get(t.cekiciId);
      if (onayliCekici === undefined) {
        const c = await getCekiciById(t.cekiciId);
        onayliCekici = Boolean(c?.rozetAktif);
        rozetCache.set(t.cekiciId, onayliCekici);
      }

      return {
        id: t.id,
        cekiciAd:
          t.cekiciAd.split(" ")[0] +
          " " +
          (t.cekiciAd.split(" ")[1]?.charAt(0) ?? "") +
          ".",
        fiyat: t.fiyat,
        ilkFiyat,
        fiyatDegisti,
        secilebilir: !fiyatDegisti,
        tahminiSureDk: musteriGosterimSureDk(
          t.tahminiSureDk,
          talep.hedefBilinmiyor
        ),
        mesaj: t.mesaj,
        tarih: t.tarih,
        onayliCekici,
        tercihPuani: puan.gorunurTercihPuani ?? puan.tercihPuani,
        tercihYuzde: puan.tercihYuzde,
        hizmetPuani: puan.hizmetPuani,
        hizmetDegerlendirmeAdet: puan.hizmetDegerlendirmeAdet,
        fiyatGarantiPuani: puan.fiyatGarantiPuani,
        fiyatGarantiYuzde: puan.fiyatGarantiYuzde,
      };
    })
  );

  const teklifler = teklifleriSirala(tekliflerHam);

  return NextResponse.json({
    teklifler,
    teklifSayisi: teklifler.length,
    ihaleAcik: ihaleAcikMi(talep),
    ihaleBitis: talep.ihaleBitis,
    kazananSecildi: !!talep.kazananCekiciId,
    durum: talep.durum,
    hedefKonum: talep.hedefKonum,
    hedefBilinmiyor: Boolean(talep.hedefBilinmiyor),
  });
}
