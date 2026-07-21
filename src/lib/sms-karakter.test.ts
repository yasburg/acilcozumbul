import { describe, expect, it } from "vitest";
import {
  NETGSM_TOPLU_SMS_BIRIM,
  netgsmSmsBirimHesapla,
  netgsmSmsMesajGecerliMi,
  netgsmSmsParcaSayisi,
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
});
