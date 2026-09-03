import { describe, expect, it } from "vitest";
import {
  abonelikIslemDetayId,
  abonelikIslemIdFromDetay,
  adSoyadAyir,
  krediOdemeAbonelikMi,
  satinAlmaFaturaDurumunaGoreSirala,
  satinAlmaFaturaGruplari,
  satinAlmaFiltreParse,
  satinAlmaTipEtiket,
  satinAlmaTipFiltreyeUyar,
} from "./panel-satin-almalar";

describe("adSoyadAyir", () => {
  it("ad ve soyadı ayırır", () => {
    expect(adSoyadAyir("Yasin Aydın")).toEqual({
      ad: "Yasin",
      soyad: "Aydın",
    });
    expect(adSoyadAyir("Ali")).toEqual({ ad: "Ali", soyad: "" });
  });
});

describe("satinAlma filtre", () => {
  it("etiket ve filtre", () => {
    expect(satinAlmaTipEtiket("abonelik")).toBe("Abonelik ödemesi");
    expect(satinAlmaTipEtiket("kredi")).toBe("Kredi alımı");
    expect(satinAlmaTipEtiket("rozet")).toBe("Doğrulanmış hesap rozeti");
    expect(satinAlmaFiltreParse("abonelik")).toBe("abonelik");
    expect(satinAlmaFiltreParse("rozet")).toBe("rozet");
    expect(satinAlmaFiltreParse(null)).toBe("hepsi");
    expect(satinAlmaTipFiltreyeUyar("abonelik_yenileme", "abonelik")).toBe(
      true
    );
    expect(satinAlmaTipFiltreyeUyar("kredi", "abonelik")).toBe(false);
    expect(satinAlmaTipFiltreyeUyar("rozet", "rozet")).toBe(true);
    expect(satinAlmaTipFiltreyeUyar("rozet", "kredi")).toBe(false);
  });
});

describe("krediOdemeAbonelikMi", () => {
  it("odemeTipi ve order set", () => {
    expect(
      krediOdemeAbonelikMi({ id: "x", odemeTipi: "abonelik" }, new Set())
    ).toBe(true);
    expect(
      krediOdemeAbonelikMi({ id: "x", odemeTipi: "kredi" }, new Set())
    ).toBe(false);
    expect(
      krediOdemeAbonelikMi({ id: "x", odemeTipi: "kredi" }, new Set(["x"]))
    ).toBe(true);
    expect(
      krediOdemeAbonelikMi({ id: "ord-1" }, new Set(["ord1"]))
    ).toBe(true);
  });
});

describe("abonelik islem detay id", () => {
  it("prefix roundtrip", () => {
    expect(abonelikIslemIdFromDetay(abonelikIslemDetayId("abc"))).toBe("abc");
    expect(abonelikIslemIdFromDetay("normal-id")).toBeNull();
  });
});

describe("fatura grup / sıra", () => {
  it("yüklenmeyenler üstte ve gruplanır", () => {
    const liste = [
      { id: "a", faturaYuklu: true, olusturulma: "2026-08-05T10:00:00Z" },
      { id: "b", faturaYuklu: false, olusturulma: "2026-08-04T10:00:00Z" },
      { id: "c", faturaYuklu: false, olusturulma: "2026-08-05T12:00:00Z" },
    ];
    const sirali = satinAlmaFaturaDurumunaGoreSirala(liste);
    expect(sirali.map((x) => x.id)).toEqual(["c", "b", "a"]);
    const { bekleyen, yuklu } = satinAlmaFaturaGruplari(sirali);
    expect(bekleyen.map((x) => x.id)).toEqual(["c", "b"]);
    expect(yuklu.map((x) => x.id)).toEqual(["a"]);
  });
});
