import { describe, expect, it } from "vitest";
import {
  PANEL_TALEP_MIN_OLUSTURULMA,
  panelTalepDurumEtiketi,
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
});
