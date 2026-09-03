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
import { mesafeKmHaversine } from "@/lib/geo";
import { cekiciTalepOnizleme } from "@/lib/talep-utils";
import type { Talep } from "@/lib/types";
import { talepLastikDurumuEtiket } from "@/lib/lastik-durumu";
import { demoTalepGetir, isDemoTalepId } from "@/lib/demo-oturum";
import { demoCekiciTalepGetJson } from "@/lib/demo-responses";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";
import {
  sehirBeklemeMesaji,
} from "@/lib/cekici-sehir-acilis";
import { sehirKullanimAcikMiDb } from "@/lib/cekici-sehir-acilis-db";
import { dakikaYasi, marketplaceOlayKaydet } from "@/lib/marketplace-events";
import { suggestedPriceDeneyiAcikMi } from "@/lib/marketplace-p2";
import { benzerTalepFiyatRehberi } from "@/lib/teklif-fiyat-rehberi";
import { teklifCashbackKampanyaAktifMi } from "@/lib/teklif-cashback-kampanya";
import { talepKrediIadeVarMi } from "@/lib/talep-kredi-iade";

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

/** Tam adres vermeden, gerçek veriden türetilmiş fırsat sinyalleri. */
function firsatOzeti(talep: Talep, cekici: { konumLat?: number; konumLng?: number }) {
  const mesafeKm = cekici.konumLat != null && cekici.konumLng != null && koordinatGecerli(talep.konum)
    ? mesafeKmHaversine(cekici.konumLat, cekici.konumLng, talep.konum.lat, talep.konum.lng)
    : null;
  return {
    requestAgeMin: Math.max(0, Math.floor((Date.now() - new Date(talep.olusturulma).getTime()) / 60_000)),
    activeBidCount: talep.teklifler.filter((t) => t.durum === "aktif").length,
    pickupDistanceKm: mesafeKm != null ? Math.round(mesafeKm * 10) / 10 : null,
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
      hedefBilinmiyor: Boolean(talep.hedefBilinmiyor),
      sorun: talep.sorun,
      aracModeli: talep.aracModeli,
      lastikDurumu:
        talepLastikDurumuEtiket({
          lastikDurumu: talep.lastikDurumu,
          sorun: talep.sorun,
        }) ?? undefined,
      onizleme: cekiciTalepOnizleme(talep),
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
    await marketplaceOlayKaydet({ eventType: "driver_request_viewed", talepId: talep.id, cekiciId: cekici.id, eventKey: `request-viewed:${talep.id}:${cekici.id}`, properties: { request_age_min: dakikaYasi(talep.olusturulma), bid_count: talep.teklifler.length } });
    const cashbackAktif = await teklifCashbackKampanyaAktifMi().catch(() => false);
    const iadeEdildi = cashbackAktif
      ? await talepKrediIadeVarMi(cekici.id, talep.id).catch(() => false)
      : false;
    return NextResponse.json({
      id: talep.id,
      durum: talep.durum,
      teklifVerdim: true,
      ihaleAcik: ihaleAcikMi(talep),
      ihaleBitis: talep.ihaleBitis,
      benimTeklif: benimTeklifim,
      hedefBilinmiyor: Boolean(talep.hedefBilinmiyor),
      onizleme: cekiciTalepOnizleme(talep),
      fotografUrls: talep.fotografUrls,
      ...rotaKoordinatlari(talep),
      kredi: cekiciToplamKredi(cekici),
      onayliCekici: Boolean(cekici.rozetAktif),
      firsat: firsatOzeti(talep, cekici),
      cashbackAktif,
      iadeEdildiKredi: iadeEdildi ? cekiciBildirimKrediTutari(cekici) : 0,
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

  await marketplaceOlayKaydet({ eventType: "driver_request_viewed", talepId: talep.id, cekiciId: cekici.id, eventKey: `request-viewed:${talep.id}:${cekici.id}`, properties: { request_age_min: dakikaYasi(talep.olusturulma), bid_count: talep.teklifler.length } });

  const fiyatRehberi = suggestedPriceDeneyiAcikMi()
    ? await benzerTalepFiyatRehberi(talep).catch(() => null)
    : null;

  const cashbackAktif = await teklifCashbackKampanyaAktifMi().catch(() => false);
  const bildirimKredi = cekiciBildirimKrediTutari(cekici);

  return NextResponse.json({
    id: talep.id,
    durum: talep.durum,
    ihaleAcik: true,
    ihaleBitis: talep.ihaleBitis,
    hedefBilinmiyor: Boolean(talep.hedefBilinmiyor),
    onizleme: cekiciTalepOnizleme(talep),
    fotografUrls: talep.fotografUrls,
    teklifUcretsiz: true,
    ...rotaKoordinatlari(talep),
    kredi: cekiciToplamKredi(cekici),
    onayliCekici: Boolean(cekici.rozetAktif),
    firsat: firsatOzeti(talep, cekici),
    fiyatRehberi,
    cashbackAktif,
    iadeBekleyenKredi: cashbackAktif ? bildirimKredi : 0,
    bildirimKredi,
  });
}
