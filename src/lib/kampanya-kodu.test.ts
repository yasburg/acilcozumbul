import { describe, expect, it } from "vitest";
import { kampanyaGecerliMi, kampanyaKoduGecerliMi } from "./kampanya-kodu";
import type { KampanyaKodu } from "./kampanya-kodu";

function kampanyaFixture(
  patch: Partial<KampanyaKodu> = {}
): KampanyaKodu {
  return {
    kod: "TIKTOK100",
    yeniUyeKredi: 100,
    kullanimSayisi: 0,
    aktif: true,
    olusturulma: "2026-01-01T00:00:00.000Z",
    ...patch,
  };
}

describe("kampanyaKoduGecerliMi", () => {
  it("TIKTOK100 geçerli", () => {
    expect(kampanyaKoduGecerliMi("tiktok100")).toEqual({
      ok: true,
      kod: "TIKTOK100",
    });
  });
});

describe("kampanyaGecerliMi", () => {
  it("aktif kampanya geçerli", () => {
    expect(kampanyaGecerliMi(kampanyaFixture()).ok).toBe(true);
  });

  it("pasif kampanya reddedilir", () => {
    const sonuc = kampanyaGecerliMi(kampanyaFixture({ aktif: false }));
    expect(sonuc.ok).toBe(false);
  });

  it("limit dolunca reddedilir", () => {
    const sonuc = kampanyaGecerliMi(
      kampanyaFixture({ maxKullanim: 5, kullanimSayisi: 5 })
    );
    expect(sonuc.ok).toBe(false);
  });

  it("süresi dolmuş kampanya reddedilir", () => {
    const sonuc = kampanyaGecerliMi(
      kampanyaFixture({ bitis: "2020-01-01T00:00:00.000Z" })
    );
    expect(sonuc.ok).toBe(false);
  });
});
