import { describe, expect, it } from "vitest";
import {
  KULLANIMA_ACIK_ILLER,
  sehirBeklemeMesaji,
  sehirKullanimAcikMi,
} from "./cekici-sehir-acilis";

describe("sehirKullanimAcikMi", () => {
  it("İstanbul açık", () => {
    expect(sehirKullanimAcikMi("İstanbul")).toBe(true);
  });

  it("diğer iller kapalı", () => {
    expect(sehirKullanimAcikMi("Ankara")).toBe(false);
    expect(sehirKullanimAcikMi("İzmir")).toBe(false);
  });

  it("boş / null kapalı", () => {
    expect(sehirKullanimAcikMi("")).toBe(false);
    expect(sehirKullanimAcikMi(null)).toBe(false);
  });

  it("özel acikIller listesi", () => {
    expect(sehirKullanimAcikMi("Ankara", ["Ankara"])).toBe(true);
    expect(sehirKullanimAcikMi("İstanbul", ["Ankara"])).toBe(false);
  });
});

describe("sehirBeklemeMesaji", () => {
  it("şehir adını içerir", () => {
    expect(sehirBeklemeMesaji("Ankara")).toMatch(/Ankara/);
    expect(sehirBeklemeMesaji("Ankara")).toMatch(/bekleme listesinde/);
  });
});

describe("KULLANIMA_ACIK_ILLER", () => {
  it("erken fazda yalnızca İstanbul", () => {
    expect(KULLANIMA_ACIK_ILLER).toEqual(["İstanbul"]);
  });
});
