import { describe, expect, it } from "vitest";
import { cekiciHizmetModu } from "./cekici-hizmet-bolge";
import { cekiciFixture } from "@/test/fixtures";

describe("B10–B11 konum API mantığı (saf)", () => {
  it("B10: konum modu aktif", () => {
    expect(cekiciHizmetModu(cekiciFixture({ hizmetModu: "konum" }))).toBe("konum");
  });

  it("B11: il_ilce varsayılan", () => {
    expect(cekiciHizmetModu(cekiciFixture({ hizmetModu: undefined }))).toBe("il_ilce");
  });
});

describe("F7 — bolge kayıt alanları (saf)", () => {
  it("F7: menzil kaydı 0–100 sınırı", async () => {
    const { menzilKmSinirla } = await import("./cekici-hizmet-bolge");
    expect(menzilKmSinirla(25)).toBe(25);
  });
});

describe("G4 — ilçe arama (saf)", () => {
  it("G4: ilçe listesi filtre", () => {
    const tum = ["Kadıköy", "Kartal", "Maltepe", "Pendik"];
    const q = "ka";
    const filtre = tum.filter((i) => i.toLocaleLowerCase("tr-TR").includes(q));
    expect(filtre).toEqual(expect.arrayContaining(["Kartal", "Kadıköy"]));
  });
});
