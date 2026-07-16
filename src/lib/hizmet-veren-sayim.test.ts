import { describe, expect, it } from "vitest";
import {
  cevrimiciJitterFaktor,
  cevrimiciJitterUygula,
  hizmetVerenKisaMetin,
  hizmetVerenSayimCevrimiciJitter,
  hizmetVerenSayimHesapla,
  hizmetVerenSayimMusteriGoster,
} from "./hizmet-veren-sayim";
import { cekiciFixture } from "@/test/fixtures";

describe("hizmetVerenSayimHesapla", () => {
  it("hizmet tipine göre aktif ve çevrimiçi sayar", () => {
    const simdi = new Date("2026-06-03T14:00:00+03:00");
    const cekiciler = [
      cekiciFixture({
        id: "c1",
        aktif: true,
        hizmetSorunTipleri: ["lastik", "aku"],
        musaitlikAktif: false,
      }),
      cekiciFixture({
        id: "c2",
        aktif: true,
        hizmetSorunTipleri: ["lastik"],
        musaitlikAktif: true,
        musaitlikBaslangic: "09:00",
        musaitlikBitis: "18:00",
        musaitlikGunler: [2],
      }),
      cekiciFixture({
        id: "c3",
        aktif: false,
        hizmetSorunTipleri: ["kilit"],
      }),
    ];

    const ozet = hizmetVerenSayimHesapla(cekiciler, simdi);
    const lastik = ozet.satirlar.find((s) => s.sorunTipi === "lastik")!;
    const aku = ozet.satirlar.find((s) => s.sorunTipi === "aku")!;
    const kilit = ozet.satirlar.find((s) => s.sorunTipi === "kilit")!;

    expect(lastik.aktif).toBe(2);
    expect(lastik.cevrimici).toBe(1);
    expect(aku.aktif).toBe(1);
    expect(aku.cevrimici).toBe(1);
    expect(kilit.aktif).toBe(0);
    expect(ozet.benzersizAktif).toBe(2);
    expect(ozet.benzersizCevrimici).toBe(1);
  });

  it("kısa metin üretir", () => {
    expect(hizmetVerenKisaMetin("lastik", 3, 12)).toBe(
      "3 çevrimiçi lastikçi · 12 kayıtlı"
    );
    expect(hizmetVerenKisaMetin("kilit", 0, 0)).toBe(
      "Şu an kayıtlı anahtarcı yok"
    );
  });

  it("müşteri gösterimine sabit offset ekler ve online ≤ aktif", () => {
    const simdi = new Date("2026-06-03T14:00:00+03:00");
    const ozet = hizmetVerenSayimHesapla(
      [
        cekiciFixture({
          id: "c1",
          aktif: true,
          hizmetSorunTipleri: ["lastik"],
          musaitlikAktif: false,
        }),
      ],
      simdi
    );
    const goster = hizmetVerenSayimMusteriGoster(ozet);

    expect(goster.benzersizAktif).toBe(ozet.benzersizAktif + 20);
    expect(goster.benzersizCevrimici).toBe(ozet.benzersizCevrimici + 10);
    expect(goster.benzersizCevrimici).toBeLessThanOrEqual(goster.benzersizAktif);
    expect(goster.satirlar.find((s) => s.sorunTipi === "lastik")!.aktif).toBe(
      21
    );
  });
});

describe("cevrimiciJitter", () => {
  it("seed 0 → −20%, seed 1 → +20%", () => {
    expect(cevrimiciJitterFaktor(0)).toBeCloseTo(0.8);
    expect(cevrimiciJitterFaktor(1)).toBeCloseTo(1.2);
    expect(cevrimiciJitterFaktor(0.5)).toBeCloseTo(1);
  });

  it("aktif üstünü geçmez", () => {
    expect(cevrimiciJitterUygula(12, 23, 1)).toBeLessThanOrEqual(23);
    expect(cevrimiciJitterUygula(20, 20, 1)).toBe(20);
    expect(cevrimiciJitterUygula(10, 10, 0)).toBe(8);
  });

  it("özette tüm çevrimiçi alanlar aktifi geçmez", () => {
    const ozet = hizmetVerenSayimMusteriGoster(
      hizmetVerenSayimHesapla([
        cekiciFixture({
          id: "c1",
          aktif: true,
          hizmetSorunTipleri: ["lastik"],
          musaitlikAktif: false,
        }),
      ])
    );
    const j = hizmetVerenSayimCevrimiciJitter(ozet, 1);
    expect(j.benzersizCevrimici).toBeLessThanOrEqual(j.benzersizAktif);
    for (const s of j.satirlar) {
      expect(s.cevrimici).toBeLessThanOrEqual(s.aktif);
    }
  });
});
