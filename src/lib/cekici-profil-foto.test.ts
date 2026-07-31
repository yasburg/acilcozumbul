import { describe, expect, it } from "vitest";
import {
  onayliProfilFotoUrl,
  PROFIL_FOTO_RED_SABLONLARI,
  profilFotoBase64Ayikla,
} from "./cekici-profil-foto";
import { profilFotoPanelVerisi } from "./profil-foto-panel";
import { cekiciFixture } from "@/test/fixtures";

describe("cekici-profil-foto", () => {
  it("red şablonları yüz / sade arka plan içerir", () => {
    expect(PROFIL_FOTO_RED_SABLONLARI[0]).toMatch(/yüzünüzü/i);
    expect(PROFIL_FOTO_RED_SABLONLARI[0]).toMatch(/arka plan/i);
  });

  it("onaylı URL yalnızca onaylandi durumunda", () => {
    expect(
      onayliProfilFotoUrl({
        profilFotoUrl: "https://x/a.jpg",
        profilFotoDurum: "beklemede",
      })
    ).toBeNull();
    expect(
      onayliProfilFotoUrl({
        profilFotoUrl: "https://x/a.jpg",
        profilFotoDurum: "onaylandi",
      })
    ).toBe("https://x/a.jpg");
  });

  it("geçersiz base64 reddedilir", () => {
    expect(profilFotoBase64Ayikla("")).toBeNull();
    expect(profilFotoBase64Ayikla("data:image/gif;base64,AAAA")).toBeNull();
  });
});

describe("profil-foto-panel", () => {
  it("bekleyen ve onaylı listeleri ayırır", () => {
    const veri = profilFotoPanelVerisi([
      cekiciFixture({
        id: "a",
        profilFotoDurum: "beklemede",
        profilFotoUrl: "https://x/a.jpg",
        profilFotoGonderim: "2026-01-02T00:00:00.000Z",
      }),
      cekiciFixture({
        id: "b",
        profilFotoDurum: "onaylandi",
        profilFotoUrl: "https://x/b.jpg",
        profilFotoGonderim: "2026-01-01T00:00:00.000Z",
      }),
      cekiciFixture({
        id: "c",
        profilFotoDurum: "reddedildi",
        profilFotoRedNedeni: "test",
      }),
    ]);
    expect(veri.ozet.bekleyen).toBe(1);
    expect(veri.ozet.onayli).toBe(1);
    expect(veri.ozet.reddedilen).toBe(1);
    expect(veri.bekleyen.map((s) => s.id)).toEqual(["a"]);
    expect(veri.onayli.map((s) => s.id)).toEqual(["b"]);
  });
});
