import { describe, expect, it } from "vitest";
import {
  sms50KayitFunnelHaritaKodVarsayilan,
} from "./sms50-kayit-funnel-harita-db";
import { sms50KayitUrl, sms50LinkHaritasi } from "./sms50-kampanya";

describe("sms50-kayit-funnel-harita", () => {
  it("kod varsayılanında c→b, a→a", () => {
    const h = sms50KayitFunnelHaritaKodVarsayilan();
    expect(h.c).toBe("b");
    expect(h.a).toBe("a");
  });

  it("harita override ile kayıt URL değişir", () => {
    const harita = sms50KayitFunnelHaritaKodVarsayilan();
    harita.a = "c";
    const url = sms50KayitUrl("a", "https://www.acilcozumbul.com", { harita });
    expect(url).toContain("/c?");
  });

  it("link haritası özel satırı varsayılan dışı olarak işaretler", () => {
    const harita = sms50KayitFunnelHaritaKodVarsayilan();
    const satirlar = sms50LinkHaritasi("https://www.acilcozumbul.com", harita);
    const c = satirlar.find((s) => s.varyant === "c");
    const a = satirlar.find((s) => s.varyant === "a");
    expect(c?.ozelHarita).toBe(true);
    expect(a?.ozelHarita).toBe(false);
  });
});
