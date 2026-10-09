import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("funnel ve test URL’lerini içermez", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/kayit/a"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/a"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/cekici/giris"))).toBe(false);
    expect(urls.some((u) => u.includes("/talep-olustur"))).toBe(false);
  });

  it("İstanbul hub, hizmet ve örnek ilçe-hizmet (kapı geçen) içerir", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/istanbul"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/cekici"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/bayrampasa"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/bayrampasa/cekici"))).toBe(
      true
    );
    expect(urls.some((u) => u.endsWith("/istanbul/arac-tasima"))).toBe(true);
    // Faz E: arac-tasima öncelik dışı → ilçe×hizmet sitemap’te yok
    expect(
      urls.some((u) => u.endsWith("/istanbul/bayrampasa/arac-tasima"))
    ).toBe(false);
    expect(urls.some((u) => u.endsWith("/hizmet-veren"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/rehber"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/rehber/cekici-ne-kadar"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/nasil-calisir"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/hakkimizda"))).toBe(true);
  });

  it("büyük 5 dışı ilçe sitemap’te var, ilçe×hizmet yok; periferi hub yok", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/adana"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/adana/cekici"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/adana/seyhan"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/adana/seyhan/cekici"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/ankara/cankaya/cekici"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/adalar"))).toBe(false);
    expect(urls.some((u) => u.endsWith("/istanbul/adalar/cekici"))).toBe(
      false
    );
  });
});
