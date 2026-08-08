import { describe, expect, it } from "vitest";
import {
  profilFotoOnaySmsMetni,
  profilFotoRedSmsMetni,
  rozetBelgeOnaySmsMetni,
  rozetBelgeRedSmsMetni,
} from "./cekici-karar-sms";

describe("cekici-karar-sms", () => {
  it("belge onay mesajında hesap linki vardır", () => {
    const m = rozetBelgeOnaySmsMetni("https://www.acilcozumbul.com");
    expect(m).toContain("onaylandi");
    expect(m).toContain("/cekici/panel?tab=hesabim");
  });

  it("belge red mesajına neden ekler", () => {
    const m = rozetBelgeRedSmsMetni(
      "https://www.acilcozumbul.com",
      "Ruhsat okunaksız"
    );
    expect(m).toContain("reddedildi");
    expect(m).toContain("Ruhsat okunaksiz");
    expect(m).toContain("/cekici/panel?tab=hesabim");
  });

  it("profil foto onay mesajı", () => {
    const m = profilFotoOnaySmsMetni("https://www.acilcozumbul.com");
    expect(m).toContain("Profil fotografiniz onaylandi");
    expect(m).toContain("/cekici/panel?tab=hesabim");
  });

  it("profil foto red mesajına neden ekler", () => {
    const m = profilFotoRedSmsMetni(
      "https://www.acilcozumbul.com",
      "Yüz görünmüyor"
    );
    expect(m).toContain("reddedildi");
    expect(m).toContain("Yuz gorunmuyor");
    expect(m).toContain("/cekici/panel?tab=hesabim");
  });
});
