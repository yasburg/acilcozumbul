import { beforeEach, describe, expect, it, vi } from "vitest";
import { cekiciFixture } from "@/test/fixtures";
import { kayitBaslangicKredisiCoz, kayitKoduHazirla } from "./kayit-kodu";

vi.mock("./kampanya-db", () => ({
  getKampanyaByKod: vi.fn(),
  kaydetKampanyaKullanim: vi.fn(),
}));

vi.mock("./supabase/kampanya-schema", () => ({
  kampanyaKoduSutunuVar: vi.fn().mockResolvedValue(true),
}));

vi.mock("./db", () => ({
  getCekiciByDavetKodu: vi.fn(),
  getCekiciById: vi.fn(),
  kaydetDavetKullanim: vi.fn(),
  updateCekici: vi.fn(),
}));

vi.mock("./kayit-ucretsiz-kredi", () => ({
  kayitUcretsizKrediMiktari: vi.fn().mockResolvedValue(9),
}));

import { getKampanyaByKod } from "./kampanya-db";
import { getCekiciByDavetKodu } from "./db";
import { kayitUcretsizKrediMiktari } from "./kayit-ucretsiz-kredi";

describe("kayitKoduHazirla", () => {
  beforeEach(() => {
    vi.mocked(getKampanyaByKod).mockReset();
    vi.mocked(getCekiciByDavetKodu).mockReset();
  });

  it("boş kod ile bonus uygulanmaz", async () => {
    const sonuc = await kayitKoduHazirla("", "05321111111");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok) expect(sonuc.sonuc.uygulandi).toBe(false);
  });

  it("kampanya kodu davet kodundan önce uygulanır", async () => {
    vi.mocked(getKampanyaByKod).mockResolvedValue({
      kod: "TIKTOK100",
      yeniUyeKredi: 100,
      kullanimSayisi: 0,
      aktif: true,
      olusturulma: new Date().toISOString(),
    });
    vi.mocked(getCekiciByDavetKodu).mockResolvedValue(
      cekiciFixture({ davetKodu: "TIKTOK100" })
    );

    const sonuc = await kayitKoduHazirla("TIKTOK100", "05321111111");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok && sonuc.sonuc.uygulandi) {
      expect(sonuc.sonuc.tip).toBe("kampanya");
      if (sonuc.sonuc.tip === "kampanya") {
        expect(sonuc.sonuc.yeniUyeKredi).toBe(100);
      }
    }
  });

  it("kampanya yoksa davet kodu uygulanır", async () => {
    vi.mocked(getKampanyaByKod).mockResolvedValue(undefined);
    vi.mocked(getCekiciByDavetKodu).mockResolvedValue(
      cekiciFixture({ davetKodu: "AHMET34", telefon: "05322222222" })
    );

    const sonuc = await kayitKoduHazirla("AHMET34", "05321111111");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok && sonuc.sonuc.uygulandi) {
      expect(sonuc.sonuc.tip).toBe("davet");
    }
  });

  it("bilinmeyen kod reddedilir", async () => {
    vi.mocked(getKampanyaByKod).mockResolvedValue(undefined);
    vi.mocked(getCekiciByDavetKodu).mockResolvedValue(undefined);

    const sonuc = await kayitKoduHazirla("BILINMEZ99", "05321111111");
    expect(sonuc.ok).toBe(false);
  });
});

describe("kayitBaslangicKredisiCoz", () => {
  beforeEach(() => {
    vi.mocked(kayitUcretsizKrediMiktari).mockReset();
    vi.mocked(kayitUcretsizKrediMiktari).mockResolvedValue(9);
  });

  it("kodsuz kayıtta ücretsiz krediyi verir", async () => {
    const r = await kayitBaslangicKredisiCoz({ uygulandi: false });
    expect(r).toEqual({ kredi: 9, kaynak: "ucretsiz" });
  });

  it("ücretsiz ayar kapalıysa 0 verir", async () => {
    vi.mocked(kayitUcretsizKrediMiktari).mockResolvedValue(0);
    const r = await kayitBaslangicKredisiCoz({ uygulandi: false });
    expect(r).toEqual({ kredi: 0, kaynak: "yok" });
  });

  it("kampanya kodu varken ücretsiz ayarı yok sayar", async () => {
    const r = await kayitBaslangicKredisiCoz({
      uygulandi: true,
      tip: "kampanya",
      kod: "TIKTOK100",
      yeniUyeKredi: 100,
    });
    expect(r).toEqual({ kredi: 100, kaynak: "kampanya" });
    expect(kayitUcretsizKrediMiktari).not.toHaveBeenCalled();
  });
});
