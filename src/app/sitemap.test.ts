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

  it("İstanbul hub, hizmet ve örnek ilçe-hizmet içerir", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/istanbul"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/cekici"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/bayrampasa"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/istanbul/bayrampasa/cekici"))).toBe(
      true
    );
    expect(urls.some((u) => u.endsWith("/hizmet-veren"))).toBe(true);
  });
});
