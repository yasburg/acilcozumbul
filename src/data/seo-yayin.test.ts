import { describe, expect, it } from "vitest";
import {
  seoDerinSehirMi,
  seoIlceHizmetIndexlensinMi,
  seoIlceHizmetYayindaMi,
  seoIlceIndexlensinMi,
  seoIlceYayindaMi,
  seoSitemapIlceSluglari,
  seoYayinIlceSluglari,
} from "./seo-yayin";

describe("seo-yayin crawl bütçesi", () => {
  it("büyük 5 derin, diğerleri değil", () => {
    expect(seoDerinSehirMi("istanbul")).toBe(true);
    expect(seoDerinSehirMi("ankara")).toBe(true);
    expect(seoDerinSehirMi("adana")).toBe(false);
    expect(seoIlceHizmetIndexlensinMi("izmir")).toBe(true);
    expect(seoIlceHizmetIndexlensinMi("adana")).toBe(false);
  });

  it("ilçe hub: merkez index, periferi noindex (derin); diğer iller index", () => {
    expect(seoIlceYayindaMi("ankara", "cankaya")).toBe(true);
    expect(seoIlceYayindaMi("adana", "seyhan")).toBe(true);
    expect(seoIlceIndexlensinMi("adana")).toBe(true);
    expect(seoIlceIndexlensinMi("adana", "seyhan")).toBe(true);
    expect(seoIlceIndexlensinMi("istanbul", "kadikoy")).toBe(true);
    expect(seoIlceIndexlensinMi("istanbul", "adalar")).toBe(false);
    expect(seoYayinIlceSluglari("adana").length).toBeGreaterThan(5);
  });

  it("ilçe×hizmet: sayfa her yerde var; index yalnız derin + kapı", () => {
    expect(seoIlceHizmetYayindaMi("istanbul", "bayrampasa", "cekici")).toBe(
      true
    );
    expect(seoIlceHizmetYayindaMi("adana", "seyhan", "cekici")).toBe(true);
    expect(
      seoIlceHizmetIndexlensinMi("istanbul", "bayrampasa", "cekici")
    ).toBe(true);
    expect(
      seoIlceHizmetIndexlensinMi("istanbul", "bayrampasa", "arac-tasima")
    ).toBe(false);
    expect(seoIlceHizmetIndexlensinMi("istanbul", "adalar", "cekici")).toBe(
      false
    );
    expect(seoIlceHizmetIndexlensinMi("adana", "seyhan", "cekici")).toBe(
      false
    );
    expect(seoSitemapIlceSluglari("ankara").length).toBeGreaterThan(10);
    expect(seoSitemapIlceSluglari("adana").length).toBeGreaterThan(5);
    expect(seoSitemapIlceSluglari("istanbul")).not.toContain("adalar");
    expect(seoSitemapIlceSluglari("istanbul")).toContain("kadikoy");
  });
});
