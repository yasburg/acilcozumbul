import { describe, expect, it } from "vitest";
import {
  PANEL_TALEP_MIN_OLUSTURULMA,
  panelTalepDurumEtiketi,
  panelTalepIptalSureEtiketi,
  talepSehirEtiketi,
} from "./panel-talep";

describe("panel-talep", () => {
  it("min tarih 28.07.2026 TR gece yarısı", () => {
    expect(PANEL_TALEP_MIN_OLUSTURULMA).toBe("2026-07-27T21:00:00.000Z");
    expect(new Date(PANEL_TALEP_MIN_OLUSTURULMA).toISOString()).toBe(
      PANEL_TALEP_MIN_OLUSTURULMA
    );
  });

  it("şehir etiketi", () => {
    expect(talepSehirEtiketi("İstanbul")).toBe("İstanbul");
    expect(talepSehirEtiketi("")).toBe("Belirtilmemiş");
    expect(talepSehirEtiketi(null)).toBe("Belirtilmemiş");
  });

  it("durum etiketi", () => {
    expect(panelTalepDurumEtiketi("ihalede")).toBe("İhalede");
    expect(panelTalepDurumEtiketi("anlaşıldı")).toBe("Anlaşıldı");
  });

  it("iptal süre etiketi", () => {
    const bas = "2026-08-10T04:10:00.000Z";
    expect(panelTalepIptalSureEtiketi(bas, undefined)).toBeNull();
    expect(
      panelTalepIptalSureEtiketi(bas, "2026-08-10T04:10:45.000Z")
    ).toBe("45 saniye sonra iptal edildi");
    expect(
      panelTalepIptalSureEtiketi(bas, "2026-08-10T04:12:20.000Z")
    ).toBe("2 dk 20 sn sonra iptal edildi");
    expect(
      panelTalepIptalSureEtiketi(bas, "2026-08-10T04:25:00.000Z")
    ).toBe("15 dakika sonra iptal edildi");
    expect(
      panelTalepIptalSureEtiketi(bas, "2026-08-10T06:40:00.000Z")
    ).toBe("2 saat 30 dk sonra iptal edildi");
  });
});
