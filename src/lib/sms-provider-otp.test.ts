import { describe, expect, it } from "vitest";
import { OTP_SMS_MAX_LEN, otpMesajAscii } from "./sms-provider";
import { cekiciTalepSmsMetni } from "./sms";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

describe("otpMesajAscii", () => {
  it("Türkçe karakterleri ASCII yapar", () => {
    expect(otpMesajAscii("doğrulama geçerlidir")).toBe("dogrulama gecerlidir");
  });

  it("kısa mesajda URL kesmez; uzun öneği kısaltır", () => {
    const link =
      "https://www.acilcozumbul.com/cekici/talep/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee?t=ffffffff-1111-2222-3333-444444444444";
    const uzunAdres =
      "asdf a. yolda kaldi (Eski Edirne Asfalti, Yildirim Mahallesi, Bayrampasa, Istanbul, Marmara Bolgesi, 34045, Turkiye). Teklif ver: ";
    const sonuc = otpMesajAscii(uzunAdres + link);
    expect(sonuc.length).toBeLessThanOrEqual(OTP_SMS_MAX_LEN);
    expect(sonuc).toContain(link);
    expect(sonuc.endsWith(link) || sonuc.includes(link)).toBe(true);
  });
});

describe("cekiciTalepSmsMetni (OTP 155)", () => {
  it("kısa konum + tam ihale linki; tam adres kullanmaz", () => {
    const c = cekiciFixture({ token: "tok-1" });
    const t = talepFixture({
      id: "talep-uuid-1",
      ad: "Asdf",
      soyad: "Test",
      konumIl: "İstanbul",
      konumIlce: "Bayrampaşa",
      konum: {
        lat: 1,
        lng: 2,
        adres:
          "Eski Edirne Asfaltı, Yıldırım Mahallesi, Bayrampaşa, İstanbul, Marmara Bölgesi, 34045, Türkiye",
      },
    });
    const { mesaj, link } = cekiciTalepSmsMetni(
      t,
      c,
      "https://www.acilcozumbul.com"
    );
    expect(mesaj).toContain(link);
    expect(mesaj).toContain("/cekici/talep/talep-uuid-1?t=tok-1");
    expect(mesaj).toContain("[Bayrampaşa]");
    expect(mesaj).not.toContain("Eski Edirne");
    const gonderilen = otpMesajAscii(mesaj);
    expect(gonderilen).toContain(link);
    expect(gonderilen.length).toBeLessThanOrEqual(OTP_SMS_MAX_LEN);
  });
});
