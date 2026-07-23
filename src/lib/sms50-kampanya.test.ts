import { describe, expect, it } from "vitest";
import {
  sms50KayitUrl,
  sms50KisaPath,
  sms50MesajOlustur,
  sms50VaryantMi,
} from "./sms50-kampanya";

describe("sms50-kampanya", () => {
  it("yalnızca a–z varyant kabul eder", () => {
    expect(sms50VaryantMi("a")).toBe(true);
    expect(sms50VaryantMi("z")).toBe(true);
    expect(sms50VaryantMi("A")).toBe(false);
    expect(sms50VaryantMi("ab")).toBe(false);
    expect(sms50VaryantMi("1")).toBe(false);
  });

  it("kısa path ve kayıt URL üretir", () => {
    expect(sms50KisaPath("c")).toBe("/sms50c");
    const kayit = sms50KayitUrl("c", "https://www.acilcozumbul.com");
    expect(kayit).toContain("/cekici/kayit?");
    expect(kayit).toContain("kampanya=SMS50");
    expect(kayit).toContain("utm_content=c");
    expect(kayit).toContain("utm_campaign=istanbul_cekici");
    expect(kayit).not.toContain("sms_token=");
  });

  it("şablonda {{LINK}} değiştirir", () => {
    const m = sms50MesajOlustur({
      govde: "Kaydol: {{LINK}}",
      varyant: "b",
      footerEkle: false,
      baseUrl: "https://www.acilcozumbul.com",
    });
    expect(m).toBe("Kaydol: https://www.acilcozumbul.com/sms50b");
  });
});
