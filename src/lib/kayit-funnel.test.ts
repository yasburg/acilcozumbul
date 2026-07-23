import { describe, expect, it } from "vitest";
import {
  kayitFunnelAktifListe,
  kayitFunnelGetir,
  kayitFunnelMi,
  kayitFunnelYolu,
  kayitHizmetSorunOnerisi,
} from "./kayit-funnel";

describe("kayit-funnel", () => {
  it("harf doğrular", () => {
    expect(kayitFunnelMi("a")).toBe(true);
    expect(kayitFunnelMi("B")).toBe(false);
    expect(kayitFunnelMi("aa")).toBe(false);
  });

  it("yol üretir", () => {
    expect(kayitFunnelYolu("b")).toBe("/kayit/b");
  });

  it("aktif listede a–d var", () => {
    const ids = kayitFunnelAktifListe().map((f) => f.id);
    expect(ids).toEqual(["a", "b", "c", "d"]);
  });

  it("b phone_first çekici", () => {
    const f = kayitFunnelGetir("b");
    expect(f?.tip).toBe("phone_first");
    expect(f?.hizmetOnsecim).toBe("cekici");
    expect(kayitHizmetSorunOnerisi("cekici")).toContain("cekici");
  });
});
