import { describe, expect, it } from "vitest";
import {
  faturaBelgeNoUret,
  faturaDeepLinkDegerlendir,
  faturaDeepLinkExpiresAt,
  faturaDeepLinkSuresiDolduMu,
  faturaKdvAyir,
  faturaPath,
  faturaPdfErisimKontrol,
  faturaSmsMetni,
  faturaTokenGecerliMi,
  faturaTokenUret,
  FATURA_DEEP_LINK_TTL_MS,
  FATURA_TOKEN_BYTES,
} from "./fatura-link";

describe("faturaToken", () => {
  it("base64url formatında ~32 byte üretir", () => {
    const t = faturaTokenUret();
    expect(faturaTokenGecerliMi(t)).toBe(true);
    expect(t.length).toBeGreaterThanOrEqual(40);
    expect(t.length).toBeLessThanOrEqual(48);
    expect(Buffer.from(t, "base64url").length).toBe(FATURA_TOKEN_BYTES);
  });

  it("geçersiz tokenları reddeder", () => {
    expect(faturaTokenGecerliMi("")).toBe(false);
    expect(faturaTokenGecerliMi("abc")).toBe(false);
    expect(faturaTokenGecerliMi("!!!")).toBe(false);
  });
});

describe("faturaDeepLink", () => {
  const expiresAt = faturaDeepLinkExpiresAt(
    new Date("2026-01-01T00:00:00.000Z")
  ).toISOString();

  it("oturum yoksa giris_gerekli", () => {
    expect(
      faturaDeepLinkDegerlendir({
        oturumCekiciId: null,
        kayit: { id: "f1", cekiciId: "c1", expiresAt },
      })
    ).toEqual({ ok: false, neden: "giris_gerekli" });
  });

  it("sahip eşleşince faturaId döner", () => {
    expect(
      faturaDeepLinkDegerlendir({
        oturumCekiciId: "c1",
        kayit: { id: "f1", cekiciId: "c1", expiresAt },
        now: new Date("2026-01-02T00:00:00.000Z"),
      })
    ).toEqual({ ok: true, faturaId: "f1" });
  });

  it("başka çekici / yok / süresi dolmuş → genel gecersiz", () => {
    expect(
      (faturaDeepLinkDegerlendir({
        oturumCekiciId: "c2",
        kayit: { id: "f1", cekiciId: "c1", expiresAt },
      }) as any).neden
    ).toBe("gecersiz");
    expect(
      (faturaDeepLinkDegerlendir({
        oturumCekiciId: "c1",
        kayit: null,
      }) as any).neden
    ).toBe("gecersiz");
    expect(
      (faturaDeepLinkDegerlendir({
        oturumCekiciId: "c1",
        kayit: { id: "f1", cekiciId: "c1", expiresAt },
        now: new Date(
          new Date("2026-01-01T00:00:00.000Z").getTime() +
            FATURA_DEEP_LINK_TTL_MS +
            1
        ),
      }) as any).neden
    ).toBe("gecersiz");
  });

  it("TTL 90 gün", () => {
    const from = new Date("2026-06-01T12:00:00.000Z");
    const exp = faturaDeepLinkExpiresAt(from);
    expect(exp.getTime() - from.getTime()).toBe(FATURA_DEEP_LINK_TTL_MS);
    expect(faturaDeepLinkSuresiDolduMu(exp, from)).toBe(false);
  });
});

describe("faturaPdfErisimKontrol", () => {
  it("oturumsuz 401, başka çekici 404, sahip ok", () => {
    expect(
      faturaPdfErisimKontrol({
        oturumCekiciId: null,
        faturaCekiciId: "c1",
      })
    ).toEqual({ ok: false, status: 401 });
    expect(
      faturaPdfErisimKontrol({
        oturumCekiciId: "c2",
        faturaCekiciId: "c1",
      })
    ).toEqual({ ok: false, status: 404 });
    expect(
      faturaPdfErisimKontrol({
        oturumCekiciId: "c1",
        faturaCekiciId: "c1",
      })
    ).toEqual({ ok: true });
  });
});

describe("fatura yardımcılar", () => {
  it("path ve SMS metni", () => {
    expect(faturaPath("tok")).toBe("/fatura/tok");
    expect(faturaSmsMetni("https://x/fatura/t")).toContain(
      "https://x/fatura/t"
    );
  });

  it("belge no formatı", () => {
    expect(faturaBelgeNoUret(new Date("2026-08-02T00:00:00Z"))).toMatch(
      /^ACB-20260802-[0-9A-F]{8}$/
    );
  });

  it("KDV ayrımı brütten tutarlı", () => {
    const k = faturaKdvAyir(120);
    expect(k.toplam).toBe(120);
    expect(k.matrah + k.kdv).toBeCloseTo(120, 2);
    expect(k.oran).toBe(0.2);
  });
});
