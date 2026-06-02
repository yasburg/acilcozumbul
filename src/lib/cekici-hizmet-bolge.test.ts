import { describe, expect, it } from "vitest";
import {
  cekiciHizmetBolgeleri,
  menzilKmSinirla,
  normalizeHizmetBolgeleri,
} from "./cekici-hizmet-bolge";
import { DESTEKLENEN_ILLER } from "./il-ilce";

describe("G — Veri bütünlüğü", () => {
  it("G1: eski hizmet_ilceleri + sehir → bolgeler", () => {
    const b = cekiciHizmetBolgeleri({
      id: "x",
      ad: "a",
      telefon: "05",
      token: "t",
      sifre: "s",
      kredi: 1,
      sehir: "İstanbul",
      hizmetIlceleri: ["Kadıköy", "Üsküdar"],
      aktif: true,
      kayitTarihi: "",
    });
    expect(b.İstanbul).toEqual(expect.arrayContaining(["Kadıköy", "Üsküdar"]));
  });

  it("G2: geçersiz il/ilçe filtrelenir", () => {
    const b = normalizeHizmetBolgeleri({
      "Sahte İl": ["Yokİlçe"],
      İstanbul: ["Kadıköy", "Hayaliİlçe"],
    });
    expect(b["Sahte İl"]).toBeUndefined();
    expect(b.İstanbul).toEqual(["Kadıköy"]);
  });

  it("G3: 81 il tanımlı", () => {
    expect(DESTEKLENEN_ILLER.length).toBe(81);
  });

  it("menzilKmSinirla 0–100", () => {
    expect(menzilKmSinirla(-5)).toBe(0);
    expect(menzilKmSinirla(150)).toBe(100);
    expect(menzilKmSinirla(25.7)).toBe(26);
  });
});
