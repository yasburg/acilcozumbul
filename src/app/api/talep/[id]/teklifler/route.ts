import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { teklifleriSirala } from "@/lib/teklif-siralama";
import { cekiciPuanOzeti, teklifFiyatDegistiMi } from "@/lib/cekici-puan";
import { ensureSeedData } from "@/lib/seed";
import { aktifTeklifler, ihaleAcikMi } from "@/lib/ihale";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const talep = await getTalepById(id);

  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const aktif = aktifTeklifler(talep);

  const rozetCache = new Map<string, boolean>();

  const tekliflerHam = await Promise.all(
    aktif.map(async (t) => {
      const puan = await cekiciPuanOzeti(t.cekiciId);
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
        tahminiSureDk: t.tahminiSureDk,
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
  });
}
