import { describe, expect, it } from "vitest";
import { talepIletisimTamMi, talepTelefonNorm } from "./talep-iletisim";

describe("talep-iletisim", () => {
  it("boş iletişim tamam değil", () => {
    expect(
      talepIletisimTamMi({ ad: "", soyad: "", telefon: "" })
    ).toBe(false);
  });

  it("geçerli telefon + ad + soyad tamam", () => {
    expect(
      talepIletisimTamMi({
        ad: "Ahmet",
        soyad: "-",
        telefon: "05321234567",
      })
    ).toBe(true);
  });

  it("talepTelefonNorm geçersizleri null döner", () => {
    expect(talepTelefonNorm("")).toBeNull();
    expect(talepTelefonNorm("0212")).toBeNull();
    expect(talepTelefonNorm("0532 123 45 67")).toBe("05321234567");
  });
});
