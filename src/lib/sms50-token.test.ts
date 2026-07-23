import { describe, expect, it } from "vitest";
import {
  SMS50_KISISEL_LINK_PH,
  SMS50_ORNEK_TOKEN,
  sms50KayitUrl,
  sms50KisaPath,
  sms50KisaUrl,
  sms50MesajBirimOnizleme,
  sms50MesajKisisellestir,
  sms50MesajOlustur,
  sms50TokenGecerliMi,
} from "./sms50-kampanya";
import { sms50TokenUret } from "./sms50-token";
import { netgsmSmsBirimHesapla } from "./sms-karakter";

describe("sms50 kişi token", () => {
  it("token formatı 8 char alfanumerik", () => {
    for (let i = 0; i < 20; i++) {
      const t = sms50TokenUret();
      expect(sms50TokenGecerliMi(t)).toBe(true);
      expect(t).toHaveLength(8);
    }
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
  });

  it("sabit www linkini token’lar (base URL farklı olsa bile)", () => {
    const m = sms50MesajKisisellestir({
      govde:
        "Ücretsiz kayıt: https://www.acilcozumbul.com/sms50c",
      varyant: "c",
      token: "Ab12Cd34",
      baseUrl: "https://acilcozumbul.com",
    });
    expect(m).toContain("/sms50c/Ab12Cd34");
    expect(m).not.toMatch(/sms50c(?!\/Ab12Cd34)/);
  });

  it("{{KisiselLink}} yer tutucusunu doldurur", () => {
    const m = sms50MesajKisisellestir({
      govde: `Kaydol: ${SMS50_KISISEL_LINK_PH}`,
      varyant: "a",
      token: "Zz99Yy88",
      baseUrl: "https://www.acilcozumbul.com",
    });
    expect(m).toBe(
      "Kaydol: https://www.acilcozumbul.com/sms50a/Zz99Yy88"
    );
  });

  it("link yoksa hata verir", () => {
    expect(() =>
      sms50MesajKisisellestir({
        govde: "Link yok burada",
        varyant: "b",
        token: "Ab12Cd34",
      })
    ).toThrow(/sms50b|KisiselLink/);
  });

  it("birim önizlemesi token uzunluğunu sayar", () => {
    const govde = `Kaydol: ${SMS50_KISISEL_LINK_PH}`;
    const onizleme = sms50MesajBirimOnizleme({
      govde,
      varyant: "c",
    });
    expect(onizleme).toContain(SMS50_ORNEK_TOKEN);
    expect(netgsmSmsBirimHesapla(onizleme)).toBeGreaterThan(
      netgsmSmsBirimHesapla("Kaydol: ")
    );
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
