import { describe, expect, it } from "vitest";
import {
  rehberSluglari,
  rehberYaziGetir,
  rehberYaziListesi,
  rehberYaziListesiKronolojik,
} from "./rehber";

describe("rehber", () => {
  it("20 yazı içerir ve slug’lar benzersizdir", () => {
    const list = rehberYaziListesiKronolojik();
    expect(list).toHaveLength(20);
    expect(new Set(rehberSluglari()).size).toBe(20);
  });

  it("haftalık geriye dönük tarihler — genel konular eski", () => {
    const krono = rehberYaziListesiKronolojik();
    expect(krono[0].slug).toBe("yolda-kaldim-ne-yapmaliyim");
    expect(krono[0].tarih).toBe("2026-04-30");
    expect(krono[krono.length - 1].slug).toBe("ankara-izmir-cekici");
    expect(krono[krono.length - 1].tarih).toBe("2026-09-10");

    for (let i = 1; i < krono.length; i++) {
      const onceki = new Date(krono[i - 1].tarih).getTime();
      const simdiki = new Date(krono[i].tarih).getTime();
      expect(simdiki - onceki).toBe(7 * 24 * 60 * 60 * 1000);
    }

    const yeni = rehberYaziListesi();
    expect(yeni[0].tarih >= yeni[1].tarih).toBe(true);
    expect(yeni[0].slug).toBe("ankara-izmir-cekici");
  });

  it("yeni yazılar yalnızca daha eski rehberlere link verir", () => {
    const krono = rehberYaziListesiKronolojik();
    const tarihBySlug = new Map(krono.map((y) => [y.slug, y.tarih]));

    for (const y of krono) {
      const metin = [
        y.kisaca,
        ...y.bolumler.flatMap((b) => b.paragraflar),
        ...y.faq.map((f) => f.cevap),
        ...y.linkler.map((l) => l.href),
      ].join("\n");

      const refs = [...metin.matchAll(/\/rehber\/([a-z0-9-]+)/g)].map(
        (m) => m[1]
      );
      for (const slug of refs) {
        if (slug === y.slug) continue;
        const hedefTarih = tarihBySlug.get(slug);
        expect(hedefTarih, `${y.slug} → ${slug}`).toBeTruthy();
        expect(
          hedefTarih! < y.tarih,
          `${y.slug} ileri link: ${slug} (${hedefTarih} >= ${y.tarih})`
        ).toBe(true);
      }
    }
  });

  it("her yazıda hero, kisaca, FAQ ve CTA vardır", () => {
    for (const y of rehberYaziListesi()) {
      expect(y.heroSrc.startsWith("/rehber/")).toBe(true);
      expect(y.kisaca.length).toBeGreaterThan(40);
      expect(y.bolumler.length).toBeGreaterThanOrEqual(4);
      expect(y.faq.length).toBeGreaterThanOrEqual(4);
      expect(y.ctaHref.length).toBeGreaterThan(0);
      expect(rehberYaziGetir(y.slug)?.title).toBe(y.title);
    }
  });
});
