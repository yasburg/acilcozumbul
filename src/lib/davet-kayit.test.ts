import { beforeEach, describe, expect, it, vi } from "vitest";
import { cekiciFixture } from "@/test/fixtures";
import { davetKayitHazirla } from "./davet-kayit";

vi.mock("./db", () => ({
  getCekiciByDavetKodu: vi.fn(),
  getCekiciById: vi.fn(),
  kaydetDavetKullanim: vi.fn(),
  updateCekici: vi.fn(),
}));

import { getCekiciByDavetKodu } from "./db";

describe("davetKayitHazirla", () => {
  beforeEach(() => {
    vi.mocked(getCekiciByDavetKodu).mockReset();
  });

  it("boş kod ile davet uygulanmaz", async () => {
    const sonuc = await davetKayitHazirla("", "05321111111");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok) expect(sonuc.davet.uygulandi).toBe(false);
  });

  it("geçerli kod ile davet eden bulunur", async () => {
    vi.mocked(getCekiciByDavetKodu).mockResolvedValue(
      cekiciFixture({ id: "ref-1", davetKodu: "YASIN2024", telefon: "05322222222" })
    );
    const sonuc = await davetKayitHazirla("yasin2024", "05321111111");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok && sonuc.davet.uygulandi) {
      expect(sonuc.davet.davetKodu).toBe("YASIN2024");
      expect(sonuc.davet.davetliKredi).toBe(20);
      expect(sonuc.davet.davetEdenKredi).toBe(10);
    }
  });

  it("bilinmeyen kod reddedilir", async () => {
    vi.mocked(getCekiciByDavetKodu).mockResolvedValue(undefined);
    const sonuc = await davetKayitHazirla("BILINMEZ99", "05321111111");
    expect(sonuc.ok).toBe(false);
  });

  it("kendi kodunu kullanamaz", async () => {
    vi.mocked(getCekiciByDavetKodu).mockResolvedValue(
      cekiciFixture({ davetKodu: "KENDIM", telefon: "05321111111" })
    );
    const sonuc = await davetKayitHazirla("KENDIM", "05321111111");
    expect(sonuc.ok).toBe(false);
  });
});
