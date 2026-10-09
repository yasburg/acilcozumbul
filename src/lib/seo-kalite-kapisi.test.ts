import { describe, expect, it } from "vitest";
import {
  SEO_KALITE_ONCELIK_HIZMETLER,
  seoIlceHubKaliteSonuc,
  seoIlceHizmetKaliteSonuc,
  seoKaliteGecerMi,
  seoKaliteOncelikHizmetMi,
  seoKalitePeriferiIlceMi,
} from "./seo-kalite-kapisi";

describe("seo-kalite-kapisi", () => {
  it("öncelik hizmet + merkez ilçe → geçer (şablon ince uyarısı olabilir)", () => {
    const s = seoIlceHizmetKaliteSonuc("istanbul", "bayrampasa", "cekici");
    expect(seoKaliteGecerMi(s)).toBe(true);
    expect(s.kontroller.cta).toBe(true);
    expect(s.kontroller.kapsamaAlanlari).toBe(true);
    expect(s.kontroller.kapsamaProxy).toBe(true);
    expect(s.nedenler).toEqual([]);
  });

  it("öncelik dışı hizmet → fail", () => {
    const s = seoIlceHizmetKaliteSonuc("istanbul", "bayrampasa", "arac-tasima");
    expect(seoKaliteGecerMi(s)).toBe(false);
    expect(s.kontroller.kapsamaProxy).toBe(false);
    expect(s.nedenler.some((n) => n.includes("öncelik"))).toBe(true);
  });

  it("periferi ilçe × öncelik hizmet → fail", () => {
    expect(seoKalitePeriferiIlceMi("istanbul", "adalar")).toBe(true);
    const s = seoIlceHizmetKaliteSonuc("istanbul", "adalar", "cekici");
    expect(seoKaliteGecerMi(s)).toBe(false);
    expect(s.nedenler.some((n) => n.includes("periferi"))).toBe(true);
  });

  it("geçersiz slug → fail", () => {
    const s = seoIlceHizmetKaliteSonuc("istanbul", "yok-ilce", "cekici");
    expect(seoKaliteGecerMi(s)).toBe(false);
  });

  it("merkez hub korunur; periferi hub düşer (derin şehir)", () => {
    const merkez = seoIlceHubKaliteSonuc("istanbul", "kadikoy");
    expect(seoKaliteGecerMi(merkez)).toBe(true);

    const periferi = seoIlceHubKaliteSonuc("istanbul", "adalar");
    expect(seoKaliteGecerMi(periferi)).toBe(false);
    expect(periferi.nedenler.some((n) => n.includes("tüm"))).toBe(true);
  });

  it("derin olmayan şehirde hub her zaman geçer", () => {
    const s = seoIlceHubKaliteSonuc("adana", "seyhan");
    expect(seoKaliteGecerMi(s)).toBe(true);
  });

  it("öncelik listesi beklenen ilk dalga", () => {
    expect([...SEO_KALITE_ONCELIK_HIZMETLER]).toEqual([
      "cekici",
      "lastikci",
      "aku-takviye",
    ]);
    expect(seoKaliteOncelikHizmetMi("cekici")).toBe(true);
    expect(seoKaliteOncelikHizmetMi("yol-yardim")).toBe(false);
  });
});
