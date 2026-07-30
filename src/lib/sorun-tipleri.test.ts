import { describe, expect, it } from "vitest";
import { hizmetQuerydenSorunTipi } from "./sorun-tipleri";

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
