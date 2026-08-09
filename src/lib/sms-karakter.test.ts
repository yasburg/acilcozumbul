import { describe, expect, it } from "vitest";
import {
  NETGSM_TOPLU_SMS_BIRIM,
  netgsmSmsBirimHesapla,
  netgsmSmsBolumlerGecerliMi,
  netgsmSmsKesimMetni,
  netgsmSmsMesajGecerliMi,
  netgsmSmsOtomatikBol,
  netgsmSmsParcaSayisi,
  netgsmSmsSinirAyarla,
} from "./sms-karakter";

describe("sms-karakter", () => {
  it("ASCII 150 birim = 1 SMS", () => {
    const m = "a".repeat(150);
    expect(netgsmSmsBirimHesapla(m)).toBe(150);
    expect(netgsmSmsParcaSayisi(150)).toBe(1);
    expect(netgsmSmsMesajGecerliMi(m).gecerli).toBe(true);
  });

  it("ç 2 birim sayılır", () => {
    expect(netgsmSmsBirimHesapla("ç")).toBe(2);
    expect(netgsmSmsBirimHesapla("a")).toBe(1);
  });

  it("151 birim = 2 SMS parçası", () => {
    expect(netgsmSmsParcaSayisi(NETGSM_TOPLU_SMS_BIRIM + 1)).toBe(2);
  });

  it("kesim 150 birimde durur", () => {
    const m = "a".repeat(200);
    expect(netgsmSmsKesimMetni(m).length).toBe(150);
  });

  it("otomatik böl her parçayı ≤150 tutar", () => {
    const m = "kelime ".repeat(40);
    const parts = netgsmSmsOtomatikBol(m);
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) {
      expect(netgsmSmsBirimHesapla(p)).toBeLessThanOrEqual(NETGSM_TOPLU_SMS_BIRIM);
    }
  });

  it("otomatik böl join('') ile metni korur", () => {
    const m = "kelime ".repeat(40).trimEnd() + " son";
    const parts = netgsmSmsOtomatikBol(m);
    expect(parts.join("")).toBe(m);
  });

  it("sınır ayarla metni korur", () => {
    const [a, b] = netgsmSmsSinirAyarla("abcd", "efgh", 6);
    expect(a + b).toBe("abcdefgh");
    expect(a).toBe("abcdef");
    expect(b).toBe("gh");
  });

  it("bolumler gecerli — parça limiti", () => {
    expect(netgsmSmsBolumlerGecerliMi(["ok"]).gecerli).toBe(true);
    expect(
      netgsmSmsBolumlerGecerliMi(["a".repeat(151)]).gecerli
    ).toBe(false);
  });
});
