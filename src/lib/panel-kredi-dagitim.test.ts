import { describe, expect, it } from "vitest";
import {
  krediDagitimFiltreUygula,
  krediTanimSmsMesaji,
  KREDI_TANIM_SABLON_GOVDE,
  profilFotoVarMi,
  type KrediDagitimSatir,
} from "./panel-kredi-dagitim";

function satir(
  patch: Partial<KrediDagitimSatir> & Pick<KrediDagitimSatir, "id">
): KrediDagitimSatir {
  return {
    ad: "Test",
    telefon: "05000000000",
    sehir: "İstanbul",
    kredi: 0,
    abonelikKredi: 0,
    toplamKredi: 0,
    abone: false,
    rozetAktif: false,
    profilFotoVar: false,
    teklifSayisi: 0,
    harcananKredi: 0,
    ...patch,
  };
}

describe("krediTanimSmsMesaji", () => {
  it("şablondaki {kredi} yerini doldurur", () => {
    expect(krediTanimSmsMesaji(25)).toBe(
      "Hesabiniza 25 kredi tanimlanmistir. Iyi gunler, iyi calismalar."
    );
    expect(KREDI_TANIM_SABLON_GOVDE).toContain("{kredi}");
  });
});

describe("profilFotoVarMi", () => {
  it("yok durumunda false", () => {
    expect(profilFotoVarMi({ profilFotoDurum: "yok" })).toBe(false);
  });
  it("onaylandi veya beklemede true", () => {
    expect(
      profilFotoVarMi({
        profilFotoDurum: "onaylandi",
        profilFotoUrl: "https://x",
      })
    ).toBe(true);
    expect(profilFotoVarMi({ profilFotoDurum: "beklemede" })).toBe(true);
  });
});

describe("krediDagitimFiltreUygula", () => {
  const liste = [
    satir({
      id: "1",
      sehir: "İstanbul",
      abone: true,
      rozetAktif: true,
      profilFotoVar: true,
      teklifSayisi: 5,
      harcananKredi: 30,
    }),
    satir({
      id: "2",
      sehir: "Ankara",
      abone: false,
      rozetAktif: false,
      profilFotoVar: false,
      teklifSayisi: 0,
      harcananKredi: 0,
    }),
  ];

  it("şehir + abone filtreler", () => {
    const r = krediDagitimFiltreUygula(liste, {
      sehirler: ["İstanbul"],
      abone: "evet",
    });
    expect(r.map((x) => x.id)).toEqual(["1"]);
  });

  it("teklif ve harcanan aralığı", () => {
    const r = krediDagitimFiltreUygula(liste, {
      teklifMin: 1,
      harcananMax: 50,
    });
    expect(r.map((x) => x.id)).toEqual(["1"]);
  });

  it("rozet hayır + foto yok", () => {
    const r = krediDagitimFiltreUygula(liste, {
      rozet: "hayir",
      profilFoto: "hayir",
    });
    expect(r.map((x) => x.id)).toEqual(["2"]);
  });
});
