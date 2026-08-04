import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { teklifleriSirala } from "@/lib/teklif-siralama";
import { cekiciPuanOzetleri, teklifFiyatDegistiMi } from "@/lib/cekici-puan";
import { ensureSeedData } from "@/lib/seed";
import { aktifTeklifler, ihaleAcikMi } from "@/lib/ihale";
import { demoTalepGetir, isDemoTalepId } from "@/lib/demo-oturum";
import { demoMusteriTekliflerJson } from "@/lib/demo-responses";
import {
  musteriTeklifSureKirilim,
  sorunHedefKonumGerekliMi,
} from "@/lib/sorun-tipleri";
import { koordinatGecerli } from "@/lib/koordinat";
import { surusSuresiDk } from "@/lib/google-maps";

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

  const hedefGerekli = sorunHedefKonumGerekliMi(talep.sorunTipi);
  const hedefBilinmiyor = Boolean(talep.hedefBilinmiyor);
  let cekmeHesapDk: number | null = null;
  if (
    hedefGerekli &&
    !hedefBilinmiyor &&
    talep.hedefKonum &&
    koordinatGecerli(talep.hedefKonum) &&
    koordinatGecerli(talep.konum)
  ) {
    const sure = await surusSuresiDk(
      { lat: talep.konum.lat, lng: talep.konum.lng },
      { lat: talep.hedefKonum.lat, lng: talep.hedefKonum.lng }
    );
    if (sure.dk != null) cekmeHesapDk = sure.dk;
  }

  const aktif = aktifTeklifler(talep);
  const puanMap = await cekiciPuanOzetleri(aktif.map((t) => t.cekiciId));
  const cekiciCache = new Map<
    string,
    { onayliCekici: boolean; profilFotoUrl: string | null }
  >();

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
      const sureler = musteriTeklifSureKirilim({
        tahminiSureDk: t.tahminiSureDk,
        hedefGerekli,
        hedefBilinmiyor,
        cekmeSureDk: cekmeHesapDk,
      });

      let meta = cekiciCache.get(t.cekiciId);
      if (!meta) {
        const c = await getCekiciById(t.cekiciId);
        meta = {
          onayliCekici: Boolean(c?.rozetAktif),
          profilFotoUrl:
            c?.profilFotoDurum === "onaylandi" && c.profilFotoUrl?.trim()
              ? c.profilFotoUrl.trim()
              : null,
        };
        cekiciCache.set(t.cekiciId, meta);
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
        gelisSureDk: sureler.gelisDk,
        cekmeSureDk: sureler.cekmeDk,
        tahminiSureDk:
          sureler.cekmeDk != null
            ? sureler.gelisDk + sureler.cekmeDk
            : sureler.gelisDk,
        mesaj: t.mesaj,
        tarih: t.tarih,
        onayliCekici: meta.onayliCekici,
        profilFotoUrl: meta.profilFotoUrl,
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
    hedefBilinmiyor,
  });
}
