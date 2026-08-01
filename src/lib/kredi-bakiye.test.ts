import { describe, expect, it } from "vitest";
import {
  abonelikKrediSifirlaVeYukle,
  abonelikKrediYukle,
  cekiciKrediDus,
  cekiciToplamKredi,
} from "./kredi-bakiye";

describe("kredi-bakiye", () => {
  it("toplam = abonelik + satın alınan", () => {
    expect(cekiciToplamKredi({ kredi: 100, abonelikKredi: 500 })).toBe(600);
  });

  it("önce abonelik kredisinden düşer", () => {
    const c = { kredi: 100, abonelikKredi: 50 };
    cekiciKrediDus(c, 30);
    expect(c.abonelikKredi).toBe(20);
    expect(c.kredi).toBe(100);
  });

  it("abonelik yetmezse satın alınandan düşer", () => {
    const c = { kredi: 100, abonelikKredi: 20 };
    cekiciKrediDus(c, 50);
    expect(c.abonelikKredi).toBe(0);
    expect(c.kredi).toBe(70);
  });

  it("yenilemede abonelik sıfırlanıp paket yüklenir, satın alınan kalır", () => {
    const c = { kredi: 250, abonelikKredi: 80 };
    abonelikKrediSifirlaVeYukle(c, 1100);
    expect(c.abonelikKredi).toBe(1100);
    expect(c.kredi).toBe(250);
    expect(cekiciToplamKredi(c)).toBe(1350);
  });

  it("abonelikKrediYukle ekler", () => {
    const c = { kredi: 0, abonelikKredi: 100 };
    abonelikKrediYukle(c, 500);
    expect(c.abonelikKredi).toBe(600);
  });
});
