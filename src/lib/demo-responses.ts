import { koordinatGecerli } from "./koordinat";
import {
  cekiciHaricMi,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerdiMi,
  cekiciTeklifVerebilirMi,
  cekiciYeterliBildirimKredisi,
  ihaleAcikMi,
  aktifTeklifler,
} from "./ihale";
import { talepBolge, talepSorunOzet } from "./talep-utils";
import { teklifleriSirala } from "./teklif-siralama";
import { demoRakipCekiciId } from "./demo-fixtures";
import { musteriTeklifSureKirilim, sorunHedefKonumGerekliMi } from "./sorun-tipleri";
import { cekiciToplamKredi } from "./kredi-bakiye";
import type { Cekici, Talep } from "./types";

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

/** Çekici talep detay — demo (DB yazmaz) */
export function demoCekiciTalepGetJson(talep: Talep, cekici: Cekici) {
  const benimMusterim = talep.kazananCekiciId === cekici.id;
  const teklifVerdim = cekiciTeklifVerdiMi(talep, cekici.id);
  const benimTeklifim = talep.teklifler?.find((t) => t.cekiciId === cekici.id);

  if (benimMusterim) {
    return {
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
      demoModu: true,
    };
  }

  if (cekiciHaricMi(talep, cekici.id)) {
    return {
      id: talep.id,
      durum: talep.durum,
      tercihEdilmedi: true,
      mesaj: "Müşteri sizi tercih etmedi.",
      demoModu: true,
    };
  }

  if (talep.kazananCekiciId && talep.kazananCekiciId !== cekici.id) {
    return {
      id: talep.id,
      durum: talep.durum,
      ihaleKapandi: true,
      kaybettim: teklifVerdim,
      mesaj: teklifVerdim
        ? "Başka bir çekici seçildi."
        : "Müşteri başka bir çekiciyi seçti.",
      demoModu: true,
    };
  }

  if (talep.durum === "anlaşıldı") {
    return {
      id: talep.id,
      durum: talep.durum,
      ihaleKapandi: true,
      mesaj: "Bu talep tamamlanmış.",
      demoModu: true,
    };
  }

  if (teklifVerdim && benimTeklifim) {
    return {
      id: talep.id,
      durum: talep.durum,
      teklifVerdim: true,
      ihaleAcik: ihaleAcikMi(talep),
      ihaleBitis: talep.ihaleBitis,
      benimTeklif: benimTeklifim,
      onizleme: {
        bolge: talepBolge(talep),
        sorunOzet: talepSorunOzet(talep.sorun),
        hedefBolge: talep.hedefKonum?.adres.split(",").slice(-2).join(",").trim(),
      },
      ...rotaKoordinatlari(talep),
      kredi: cekiciToplamKredi(cekici),
      onayliCekici: Boolean(cekici.rozetAktif),
      demoModu: true,
    };
  }

  if (!cekiciTeklifVerebilirMi(talep, cekici.id) && !teklifVerdim) {
    return {
      id: talep.id,
      durum: talep.durum,
      ihaleKapandi: true,
      mesaj: "Bu talebe artık teklif verilemez.",
      demoModu: true,
    };
  }

  if (!cekiciTalebeBildirildiMi(talep, cekici.id)) {
    return {
      id: talep.id,
      erisimYok: true,
      kredi: cekiciToplamKredi(cekici),
      mesaj:
        !cekiciYeterliBildirimKredisi(cekiciToplamKredi(cekici))
          ? "Krediniz yok. Demo modda 1 kredi ile katılabilirsiniz."
          : "Bu talep size henüz açılmadı. 1 kredi ile katılabilirsiniz (demo).",
      demoModu: true,
    };
  }

  return {
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
    demoModu: true,
  };
}

const DEMO_PUAN = {
  tercihPuani: 4.5,
  tercihYuzde: 85,
  hizmetPuani: 4.7,
  hizmetDegerlendirmeAdet: 12,
  fiyatGarantiPuani: 5,
  fiyatGarantiYuzde: 90,
  onayliCekici: false,
};

export function demoMusteriTekliflerJson(talep: Talep) {
  const aktif = aktifTeklifler(talep);
  const hedefGerekli = sorunHedefKonumGerekliMi(talep.sorunTipi);
  const hedefBilinmiyor = Boolean(talep.hedefBilinmiyor);
  const tekliflerHam = aktif.map((t) => {
    const fiyatDegisti = false;
    const rakip = t.cekiciId === demoRakipCekiciId();
    const sureler = musteriTeklifSureKirilim({
      tahminiSureDk: t.tahminiSureDk,
      hedefGerekli,
      hedefBilinmiyor,
      cekmeSureDk: null,
    });
    return {
      id: t.id,
      cekiciAd:
        t.cekiciAd.split(" ")[0] +
        " " +
        (t.cekiciAd.split(" ")[1]?.charAt(0) ?? "") +
        ".",
      fiyat: t.fiyat,
      ilkFiyat: t.ilkFiyat ?? t.fiyat,
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
      onayliCekici: rakip ? false : DEMO_PUAN.onayliCekici,
      tercihPuani: DEMO_PUAN.tercihPuani,
      tercihYuzde: DEMO_PUAN.tercihYuzde,
      hizmetPuani: DEMO_PUAN.hizmetPuani,
      hizmetDegerlendirmeAdet: DEMO_PUAN.hizmetDegerlendirmeAdet,
      fiyatGarantiPuani: DEMO_PUAN.fiyatGarantiPuani,
      fiyatGarantiYuzde: DEMO_PUAN.fiyatGarantiYuzde,
    };
  });

  return {
    teklifler: teklifleriSirala(tekliflerHam),
    teklifSayisi: tekliflerHam.length,
    ihaleAcik: ihaleAcikMi(talep),
    ihaleBitis: talep.ihaleBitis,
    kazananSecildi: !!talep.kazananCekiciId,
    durum: talep.durum,
    hedefKonum: talep.hedefKonum,
    hedefBilinmiyor,
    demoModu: true,
  };
}

export function demoMusteriTalepDurumJson(
  talep: Talep,
  cekiciAd?: string,
  cekiciTelefon?: string | null
) {
  const teklifler = aktifTeklifler(talep);
  const kazananSecildi = !!talep.kazananCekiciId;
  const anlasmaBekliyor =
    kazananSecildi && talep.durum === "kazanan_belli" && talep.anlasmaDurumu !== "anlaşıldı";
  const kazananTeklif = talep.kazananTeklifId
    ? talep.teklifler?.find((t) => t.id === talep.kazananTeklifId)
    : undefined;

  return {
    id: talep.id,
    durum: talep.durum,
    ihaleAcik: ihaleAcikMi(talep),
    ihaleBitis: talep.ihaleBitis,
    teklifSayisi: teklifler.length,
    bildirilenSayisi: Math.max(3, talep.bildirilenCekiciIds?.length ?? 0),
    kazananSecildi,
    anlasmaBekliyor,
    yenidenAranıyor: talep.durum === "yeniden_ihalede",
    tamamlandi: talep.durum === "anlaşıldı",
    cekiciAd,
    cekiciTelefon: kazananSecildi ? cekiciTelefon ?? null : null,
    kazananFiyat: kazananTeklif?.fiyat,
    anlasmaDurumu: talep.anlasmaDurumu,
    konum: talep.konum,
    hedefKonum: talep.hedefKonum,
    hedefKonumDegistirildi: Boolean(talep.hedefKonumDegistirildi),
    hedefBilinmiyor: Boolean(talep.hedefBilinmiyor),
    sorunTipi: talep.sorunTipi ?? null,
    memnuniyet: null,
    demoModu: true,
  };
}

export function demoKatilMesaji(cekici: Cekici) {
  return {
    success: true,
    kredi: cekiciToplamKredi(cekici),
    demoModu: true,
    mesaj: "Demo: ihaleye katıldınız (kredi düşülmedi).",
  };
}

export function demoTeklifMesaji(
  cekici: Cekici,
  talep: Talep,
  teklifId: string
) {
  return {
    teklifId,
    kredi: cekiciToplamKredi(cekici),
    demoModu: true,
    mesaj: "Demo: Teklifiniz kaydedildi (gerçek veri değişmedi).",
    onizleme: {
      bolge: talepBolge(talep),
      sorunOzet: talepSorunOzet(talep.sorun),
    },
  };
}
