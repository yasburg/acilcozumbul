import { describe, expect, it } from "vitest";
import {
  sms50KayitUrl,
  sms50KisaPath,
  sms50KisaUrl,
  sms50MesajOlustur,
  sms50TokenGecerliMi,
} from "./sms50-kampanya";
import { sms50TokenUret } from "./sms50-token";

describe("sms50 kişi token", () => {
  it("token formatı 8 char alfanumerik", () => {
    for (let i = 0; i < 20; i++) {
      const t = sms50TokenUret();
      expect(sms50TokenGecerliMi(t)).toBe(true);
      expect(t).toHaveLength(8);
    }
    expect(sms50TokenGecerliMi("short")).toBe(false);
    expect(sms50TokenGecerliMi("toolong12")).toBe(false);
    expect(sms50TokenGecerliMi("bad!char")).toBe(false);
  });

  it("token’lı kısa path ve URL", () => {
    expect(sms50KisaPath("b")).toBe("/sms50b");
    expect(sms50KisaPath("b", "Ab12Cd34")).toBe("/sms50b/Ab12Cd34");
    expect(sms50KisaUrl("b", "https://www.acilcozumbul.com", "Ab12Cd34")).toBe(
      "https://www.acilcozumbul.com/sms50b/Ab12Cd34"
    );
  });

  it("kayıt URL’sine sms_token ekler", () => {
    const u = sms50KayitUrl("c", "https://www.acilcozumbul.com", {
      smsToken: "Xy9Zp0Q1",
    });
    expect(u).toContain("sms_token=Xy9Zp0Q1");
    expect(u).toContain("utm_content=c");
  });

  it("mesajda ortak linki token’lıya çevirir", () => {
    const m = sms50MesajOlustur({
      govde: "Kaydol: https://www.acilcozumbul.com/sms50b",
      varyant: "b",
      footerEkle: false,
      baseUrl: "https://www.acilcozumbul.com",
      token: "Ab12Cd34",
    });
    expect(m).toBe("Kaydol: https://www.acilcozumbul.com/sms50b/Ab12Cd34");
  });

  it("{{LINK}} placeholder’ını token’lı URL ile doldurur", () => {
    const m = sms50MesajOlustur({
      govde: "Link: {{LINK}}",
      varyant: "a",
      footerEkle: false,
      baseUrl: "https://www.acilcozumbul.com",
      token: "Zz99Yy88",
    });
    expect(m).toBe("Link: https://www.acilcozumbul.com/sms50a/Zz99Yy88");
  });

  it("tokensuz mesaj davranışı bozulmaz", () => {
    const m = sms50MesajOlustur({
      govde: "Kaydol: {{LINK}}",
      varyant: "b",
      footerEkle: false,
      baseUrl: "https://www.acilcozumbul.com",
    });
    expect(m).toBe("Kaydol: https://www.acilcozumbul.com/sms50b");
  });
});
