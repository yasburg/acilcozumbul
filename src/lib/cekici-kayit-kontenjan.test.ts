import { describe, expect, it } from "vitest";
import {
  ERKEN_KAYIT_LIMIT,
  GOSTERILEN_KAYIT_TAVAN,
  kayitKontenjanHesapla,
} from "./cekici-kayit-kontenjan";

describe("kayitKontenjanHesapla", () => {
  it("50 kayıtta gösterilen 50", () => {
    const d = kayitKontenjanHesapla(50);
    expect(d.gosterilenKayit).toBe(50);
    expect(d.gosterilenKalan).toBe(50);
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
    expect(GOSTERILEN_KAYIT_TAVAN).toBe(97);
  });
});
