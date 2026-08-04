import { describe, expect, it } from "vitest";
import {
  HEDEF_BILINMIYOR_EK_SURE_DK,
  hizmetQuerydenSorunTipi,
  musteriTeklifSureKirilim,
} from "./sorun-tipleri";

describe("hizmetQuerydenSorunTipi", () => {
  it("Ads landing parametrelerini sorun tipine çevirir", () => {
    expect(hizmetQuerydenSorunTipi("cekici")).toBe("cekici");
    expect(hizmetQuerydenSorunTipi("lastik")).toBe("lastik");
    expect(hizmetQuerydenSorunTipi("aku")).toBe("aku");
    expect(hizmetQuerydenSorunTipi("anahtar")).toBe("kilit");
    expect(hizmetQuerydenSorunTipi("ariza")).toBe("ariza");
    expect(hizmetQuerydenSorunTipi("kaza")).toBe("kaza");
  });

  it("büyük/küçük harf ve boşluk toleranslı", () => {
    expect(hizmetQuerydenSorunTipi("  Lastik ")).toBe("lastik");
    expect(hizmetQuerydenSorunTipi("ANAHTAR")).toBe("kilit");
  });

  it("bilinmeyen veya boş değeri reddeder", () => {
    expect(hizmetQuerydenSorunTipi(null)).toBeNull();
    expect(hizmetQuerydenSorunTipi("")).toBeNull();
    expect(hizmetQuerydenSorunTipi("xyz")).toBeNull();
  });
});

describe("musteriTeklifSureKirilim", () => {
  it("hedef gerekmiyorsa yalnız geliş döner", () => {
    expect(
      musteriTeklifSureKirilim({
        tahminiSureDk: 25,
        hedefGerekli: false,
      })
    ).toEqual({ gelisDk: 25, cekmeDk: null });
  });

  it("hedef bilinmiyorsa +30 dk çekme ekler", () => {
    expect(
      musteriTeklifSureKirilim({
        tahminiSureDk: 20,
        hedefGerekli: true,
        hedefBilinmiyor: true,
      })
    ).toEqual({ gelisDk: 20, cekmeDk: HEDEF_BILINMIYOR_EK_SURE_DK });
  });

  it("toplam > çekme ise gelişi ayırır", () => {
    expect(
      musteriTeklifSureKirilim({
        tahminiSureDk: 45,
        hedefGerekli: true,
        cekmeSureDk: 15,
      })
    ).toEqual({ gelisDk: 30, cekmeDk: 15 });
  });

  it("tahmini ≤ çekme ise gelişi olduğu gibi bırakır", () => {
    expect(
      musteriTeklifSureKirilim({
        tahminiSureDk: 20,
        hedefGerekli: true,
        cekmeSureDk: 25,
      })
    ).toEqual({ gelisDk: 20, cekmeDk: 25 });
  });
});
