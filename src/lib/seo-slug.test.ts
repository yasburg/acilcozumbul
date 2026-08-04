import { describe, expect, it } from "vitest";
import { ilceSlug, sehirSlug, trSlugify } from "./seo-slug";
import { seoTalepOlusturYolu, musteriKonumYolu } from "./seo-talep";
import { seoIlceGetir, seoSehirGetir } from "./seo-geo";

describe("seo-slug", () => {
  it("Türkçe karakterleri ASCII slug yapar", () => {
    expect(trSlugify("Bayrampaşa")).toBe("bayrampasa");
    expect(trSlugify("Kadıköy")).toBe("kadikoy");
    expect(trSlugify("Şişli")).toBe("sisli");
    expect(sehirSlug("İstanbul")).toBe("istanbul");
    expect(ilceSlug("Çekmeköy")).toBe("cekmekoy");
  });
});

describe("seo-geo", () => {
  it("İstanbul ve Bayrampaşa çözümler", () => {
    expect(seoSehirGetir("istanbul")?.ad).toBe("İstanbul");
    expect(seoIlceGetir("istanbul", "bayrampasa")?.ad).toBe("Bayrampaşa");
  });
});

describe("seo-talep", () => {
  it("İstanbul şehir-only CTA hub formuna gider", () => {
    expect(seoTalepOlusturYolu({ sehir: "istanbul" })).toBe("/istanbul");
  });

  it("İstanbul ilçe CTA form path’ine gider", () => {
    expect(
      seoTalepOlusturYolu({ sehir: "istanbul", ilce: "bayrampasa" })
    ).toBe("/istanbul/bayrampasa");
  });

  it("musteriKonumYolu şehir/ilçe path üretir", () => {
    expect(musteriKonumYolu(null, null)).toBe("/");
    expect(musteriKonumYolu("İstanbul")).toBe("/istanbul");
    expect(musteriKonumYolu("Ankara")).toBe("/ankara");
    expect(musteriKonumYolu("İstanbul", "Bayrampaşa")).toBe(
      "/istanbul/bayrampasa"
    );
    expect(musteriKonumYolu("Ankara", "Çankaya")).toBe("/ankara/cankaya");
  });

  it("Ankara ilçe CTA form path’ine gider", () => {
    expect(seoTalepOlusturYolu({ sehir: "ankara", ilce: "cankaya" })).toBe(
      "/ankara/cankaya"
    );
  });

  it("SEO hizmet slug’ını form alias’ına çevirir", () => {
    expect(
      seoTalepOlusturYolu({
        sehir: "istanbul",
        ilce: "bayrampasa",
        hizmet: "lastikci",
      })
    ).toBe(
      "/talep-olustur?sehir=istanbul&ilce=bayrampasa&hizmet=lastik"
    );
    expect(
      seoTalepOlusturYolu({
        sehir: "istanbul",
        hizmet: "oto-anahtarci",
      })
    ).toBe("/talep-olustur?sehir=istanbul&hizmet=anahtar");
  });
});
