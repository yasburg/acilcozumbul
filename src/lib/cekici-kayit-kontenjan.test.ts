import { describe, expect, it } from "vitest";
import {
  ERKEN_KAYIT_LIMIT,
  GOSTERILEN_KAYIT_TABAN,
  GOSTERILEN_KAYIT_TAVAN,
  kayitKontenjanHesapla,
} from "./cekici-kayit-kontenjan";

describe("kayitKontenjanHesapla", () => {
  it("gerçek kayıt 67'nin altındaysa gösterilen en az 67", () => {
    const d = kayitKontenjanHesapla(10);
    expect(d.gosterilenKayit).toBe(67);
    expect(d.gosterilenKalan).toBe(33);
    expect(d.sonKontenjanModu).toBe(false);
  });

  it("67 kayıtta gösterilen 67", () => {
    const d = kayitKontenjanHesapla(67);
    expect(d.gosterilenKayit).toBe(67);
    expect(d.gosterilenKalan).toBe(33);
    expect(d.sonKontenjanModu).toBe(false);
  });

  it("68–96 arası gerçek sayı gösterilir", () => {
    const d = kayitKontenjanHesapla(75);
    expect(d.gosterilenKayit).toBe(75);
    expect(d.gosterilenKalan).toBe(25);
    expect(d.sonKontenjanModu).toBe(false);
  });

  it("97 kayıtta gösterilen 97, son kontenjan modu", () => {
    const d = kayitKontenjanHesapla(97);
    expect(d.gosterilenKayit).toBe(97);
    expect(d.gosterilenKalan).toBe(3);
    expect(d.sonKontenjanModu).toBe(true);
  });

  it("200 kayıtta gösterilen yine 97, kayıt engellenmez", () => {
    const d = kayitKontenjanHesapla(200);
    expect(d.gosterilenKayit).toBe(GOSTERILEN_KAYIT_TAVAN);
    expect(d.gosterilenKalan).toBe(3);
    expect(d.sonKontenjanModu).toBe(true);
  });

  it("100+ kayıtta gösterilen 97'de kalır", () => {
    const d = kayitKontenjanHesapla(100);
    expect(d.gosterilenKayit).toBe(GOSTERILEN_KAYIT_TAVAN);
    expect(d.sonKontenjanModu).toBe(true);
  });

  it("limit sabitleri", () => {
    expect(ERKEN_KAYIT_LIMIT).toBe(100);
    expect(GOSTERILEN_KAYIT_TABAN).toBe(67);
    expect(GOSTERILEN_KAYIT_TAVAN).toBe(97);
  });
});
