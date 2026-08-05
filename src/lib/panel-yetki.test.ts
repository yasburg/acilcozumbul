import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  panelEpostaIzinli,
  panelMuhasebeApiIzinli,
  panelMuhasebeSayfaIzinli,
  panelRol,
} from "./panel-yetki";

describe("panelRol", () => {
  const prevAdmin = process.env.PANEL_ADMIN_EMAILS;
  const prevMuh = process.env.PANEL_MUHASEBE_EMAILS;

  beforeEach(() => {
    process.env.PANEL_ADMIN_EMAILS = "admin@example.com";
    process.env.PANEL_MUHASEBE_EMAILS = "fatih@iror.com.tr";
  });

  afterEach(() => {
    process.env.PANEL_ADMIN_EMAILS = prevAdmin;
    process.env.PANEL_MUHASEBE_EMAILS = prevMuh;
  });

  it("admin ve muhasebe ayrımı", () => {
    expect(panelRol("admin@example.com")).toBe("admin");
    expect(panelRol("fatih@iror.com.tr")).toBe("muhasebe");
    expect(panelRol("Fatih@Iror.com.tr")).toBe("muhasebe");
    expect(panelRol("baska@x.com")).toBeNull();
    expect(panelEpostaIzinli("fatih@iror.com.tr")).toBe(true);
  });

  it("admin listesindeyse muhasebeyi ezer", () => {
    process.env.PANEL_ADMIN_EMAILS = "fatih@iror.com.tr";
    expect(panelRol("fatih@iror.com.tr")).toBe("admin");
  });
});

describe("panelMuhasebe yollar", () => {
  it("sayfa ve api izinleri", () => {
    expect(panelMuhasebeSayfaIzinli("/panel/kredi-odemeler")).toBe(true);
    expect(panelMuhasebeSayfaIzinli("/panel/kredi-odemeler/abc")).toBe(true);
    expect(panelMuhasebeSayfaIzinli("/panel/faturalar")).toBe(true);
    expect(panelMuhasebeSayfaIzinli("/panel/cekiciler")).toBe(false);
    expect(panelMuhasebeApiIzinli("/api/panel/faturalar")).toBe(true);
    expect(panelMuhasebeApiIzinli("/api/panel/cekiciler")).toBe(true);
    expect(panelMuhasebeApiIzinli("/api/panel/ozet")).toBe(false);
  });
});
