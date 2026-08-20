import { beforeEach, describe, expect, it, vi } from "vitest";
import { notifyCekiciler, notifyMusteri } from "./sms";
import {
  PANEL_BILDIRIM_KREDI,
  PREMIUM_SMS_BILDIRIM_KREDI,
} from "./ihale";
import { cekiciFixture, talepFixture } from "@/test/fixtures";
import type { Cekici } from "./types";

const getCekicilerBildirimAdaylari = vi.fn();
const getCekiciById = vi.fn();
const updateCekici = vi.fn();
const sendSms = vi.fn();
const talepSehriAcikMi = vi.fn();
const sesliMesajFireAndForget = vi.fn();
const sesliMesajGonder = vi.fn();
const sesliCekiciTalepRateLimitGecerMi = vi.fn();

vi.mock("./db", () => ({
  getCekicilerBildirimAdaylari: (...args: unknown[]) => getCekicilerBildirimAdaylari(...args),
  getCekiciById: (...args: unknown[]) => getCekiciById(...args),
  updateCekici: (...args: unknown[]) => updateCekici(...args),
}));

vi.mock("./cekici-sehir-acilis-db", () => ({
  talepSehriAcikMi: (...args: unknown[]) => talepSehriAcikMi(...args),
}));

vi.mock("./sms-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./sms-provider")>();
  return {
    ...actual,
    sendSms: (...args: unknown[]) => sendSms(...args),
  };
});

vi.mock("./sesli-mesaj", () => ({
  sesliMesajFireAndForget: (...args: unknown[]) =>
    sesliMesajFireAndForget(...args),
  sesliMesajGonder: (...args: unknown[]) => sesliMesajGonder(...args),
  sesliCekiciTalepRateLimitGecerMi: (...args: unknown[]) =>
    sesliCekiciTalepRateLimitGecerMi(...args),
}));

describe("D — Çekici bildirim (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendSms.mockResolvedValue({ basarili: true, saglayici: "mock" });
    updateCekici.mockResolvedValue(undefined);
    talepSehriAcikMi.mockResolvedValue(true);
    sesliMesajGonder.mockResolvedValue({ basarili: true });
    sesliCekiciTalepRateLimitGecerMi.mockReturnValue(true);
    getCekiciById.mockImplementation(async (id: string) => {
      const list = getCekicilerBildirimAdaylari.mock.results.at(-1)?.value;
      if (Array.isArray(list)) {
        return list.find((c: Cekici) => c.id === id) ?? null;
      }
      const resolved = await Promise.resolve(getCekicilerBildirimAdaylari.mock.results[0]?.value);
      if (Array.isArray(resolved)) {
        return resolved.find((c: Cekici) => c.id === id) ?? null;
      }
      return null;
    });
  });

  it("D1: varsayılan seviye 3 — OTP SMS + 3 kredi + sesli", async () => {
    const c1 = cekiciFixture({ id: "c1", telefon: "05321111111" });
    const c2 = cekiciFixture({ id: "c2", telefon: "05322222222" });
    const c3 = cekiciFixture({
      id: "c3",
      hizmetBolgeleri: { İstanbul: ["Beşiktaş"] },
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1, c2, c3]);
    getCekiciById.mockImplementation(async (id: string) =>
      [c1, c2, c3].find((c) => c.id === id) ?? null
    );
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    const ids = await notifyCekiciler(t, "http://localhost:3000");
    expect(ids.sort()).toEqual(["c1", "c2"]);
    expect(sendSms).toHaveBeenCalledTimes(2);
    const meta = sendSms.mock.calls[0][2] as {
      krediMiktar?: number;
      kanal?: string;
    };
    expect(meta.krediMiktar).toBe(3);
    expect(meta.kanal).toBe("otp");
    expect(sendSms.mock.calls[0][2]).toMatchObject({ krediDus: false });
    expect(sesliMesajGonder).toHaveBeenCalled();
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
  });

  it("D1a: seviye 1 → toplu SMS + 1 kredi, sesli yok", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      bildirimSeviye: 1,
      premiumSmsAktif: false,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    getCekiciById.mockImplementation(async (id: string) =>
      id === "c1" ? c1 : null
    );
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    const ids = await notifyCekiciler(t, "http://localhost:3000");
    expect(ids).toEqual(["c1"]);
    const meta = sendSms.mock.calls[0][2] as {
      krediMiktar?: number;
      kanal?: string;
    };
    expect(meta.krediMiktar).toBe(PANEL_BILDIRIM_KREDI);
    expect(meta.kanal).toBe("xml");
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
  });

  it("D1b: seviye 2 → hızlı SMS + 2 kredi, sesli yok", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      bildirimSeviye: 2,
      kredi: 5,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    const ids = await notifyCekiciler(t, "http://localhost:3000");
    expect(ids).toEqual(["c1"]);
    expect(sendSms).toHaveBeenCalledTimes(1);
    const meta = sendSms.mock.calls[0][2] as {
      krediMiktar?: number;
      kanal?: string;
    };
    expect(meta.krediMiktar).toBe(PREMIUM_SMS_BILDIRIM_KREDI);
    expect(meta.kanal).toBe("otp");
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
  });

  it("D1c: seviye 3 → sesli + hızlı SMS", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      bildirimSeviye: 3,
      kredi: 5,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(sesliMesajGonder).toHaveBeenCalledWith(
      "cekici_yeni_talep",
      "05321111111",
      expect.objectContaining({
        relationid: expect.stringContaining("c1"),
      })
    );
    expect(updateCekici).toHaveBeenCalled();
  });

  it("D1d: seviye 3 sesli fail → 2 kredi düşülür", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      bildirimSeviye: 3,
      kredi: 5,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    getCekiciById.mockResolvedValue({ ...c1 });
    sesliMesajGonder.mockResolvedValue({
      basarili: false,
      hata: "Netgsm hata",
    });
    await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(sendSms.mock.calls[0][2]).toMatchObject({ krediDus: false });
    const guncellenen = updateCekici.mock.calls[0][0] as Cekici;
    expect(Number(guncellenen.kredi) + Number(guncellenen.abonelikKredi || 0)).toBe(3); // 5-2
  });

  it("D1e: seviye 3 rate-limit → sesli yok, 2 kredi", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      bildirimSeviye: 3,
      kredi: 5,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    getCekiciById.mockResolvedValue({ ...c1 });
    sesliCekiciTalepRateLimitGecerMi.mockReturnValue(false);
    await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(sesliMesajGonder).not.toHaveBeenCalled();
    const guncellenen = updateCekici.mock.calls[0][0] as Cekici;
    expect(Number(guncellenen.kredi) + Number(guncellenen.abonelikKredi || 0)).toBe(3);
  });

  it("D2: aktif false → bildirim yok", async () => {
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", aktif: false }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("D3: kredi < panel tutarı → bildirim yok", async () => {
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", kredi: PANEL_BILDIRIM_KREDI - 0.5 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D5: kredi 0 → bildirim yok", async () => {
    getCekicilerBildirimAdaylari.mockResolvedValue([cekiciFixture({ id: "c1", kredi: 0 })]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D6: haric tutulan çekiciye yeniden arama gitmez", async () => {
    const c1 = cekiciFixture({ id: "c1" });
    const c2 = cekiciFixture({ id: "c2" });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1, c2]);
    getCekiciById.mockImplementation(async (id: string) =>
      [c1, c2].find((c) => c.id === id) ?? null
    );
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    await notifyCekiciler(t, "http://localhost:3000", ["c1"], {
      yenidenArama: true,
    });
    expect(sendSms).toHaveBeenCalledTimes(1);
    expect(sendSms.mock.calls[0][2]).toMatchObject({
      cekiciId: "c2",
      kanal: "otp",
    });
  });

  it("D7: premium yeniden arama mesajı — sesli yok", async () => {
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ premiumSmsAktif: true, kredi: 5 }),
    ]);
    await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000",
      [],
      { yenidenArama: true }
    );
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("Yeni yol yardim talebi (tekrar)");
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
    expect(sesliMesajGonder).not.toHaveBeenCalled();
  });

  it("D8: premium ilk talep mesajı ve kısa link", async () => {
    const c = cekiciFixture({
      token: "abc-token",
      premiumSmsAktif: true,
      kredi: 5,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c]);
    const t = talepFixture({
      id: "t99",
      ad: "Asdf",
      soyad: "Test",
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
    });
    await notifyCekiciler(t, "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("Yeni yol yardim talebi: Kadıköy");
    expect(mesaj).not.toContain("Asdf");
    expect(mesaj).not.toContain("yolda kaldi");
    expect(mesaj).toMatch(/\/t\/[0-9A-Za-z]{8}/);
    expect(mesaj).not.toContain("t=abc-token");
    expect(mesaj).not.toMatch(/\([^)]{20,}\)/);
  });

  it("D9: premium altyapı hatası → panelde açık sayılır, sesli yok", async () => {
    sendSms.mockResolvedValue({
      basarili: false,
      saglayici: "mock",
      hata: "Netgsm yapılandırılmamış",
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", premiumSmsAktif: true, kredi: 5 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual(["c1"]);
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
    expect(sesliMesajGonder).not.toHaveBeenCalled();
  });

  it("D9b: yetersiz kredi hatası → bildirilenIds'e eklenmez, sesli yok", async () => {
    sendSms.mockResolvedValue({
      basarili: false,
      saglayici: "mock",
      hata: "Yetersiz kredi (SMS bildirimi için 2 kredi gerekir)",
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", premiumSmsAktif: true, kredi: 5 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
    expect(sesliMesajGonder).not.toHaveBeenCalled();
  });

  it("D10: çok sayıda uygun çekici — hepsine premium SMS", async () => {
    const list: Cekici[] = Array.from({ length: 5 }, (_, i) =>
      cekiciFixture({ id: `c${i}`, telefon: `0532000000${i}` })
    );
    getCekicilerBildirimAdaylari.mockResolvedValue(list);
    getCekiciById.mockImplementation(
      async (id: string) => list.find((c) => c.id === id) ?? null
    );
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toHaveLength(5);
    expect(sendSms).toHaveBeenCalledTimes(5);
    expect(sendSms.mock.calls[0][2]).toMatchObject({
      kanal: "otp",
      krediMiktar: 3,
    });
  });

  it("D4: seviye 1 + kredi 1 — toplu SMS dahil", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      kredi: 1,
      bildirimSeviye: 1,
      premiumSmsAktif: false,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    getCekiciById.mockResolvedValue(c1);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual(["c1"]);
  });

  it("seviye 3 için 2 kredi yetersiz", async () => {
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", kredi: 2, bildirimSeviye: 3 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("kapalı şehir — SMS gitmez", async () => {
    talepSehriAcikMi.mockResolvedValue(false);
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", kredi: 10 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "Kocaeli", konumIlce: "Körfez" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
    expect(sendSms).not.toHaveBeenCalled();
    expect(getCekicilerBildirimAdaylari).not.toHaveBeenCalled();
  });

  it("D-local: development’ta yalnız tester çekicilere SMS", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMS_TESTER_ONLY", "");
    const normal = cekiciFixture({ id: "c1", telefon: "05321111111" });
    const tester = cekiciFixture({
      id: "c2",
      telefon: "05322222222",
      testerHesap: true,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([normal, tester]);
    getCekiciById.mockImplementation(async (id: string) =>
      [normal, tester].find((c) => c.id === id) ?? null
    );
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual(["c2"]);
    expect(sendSms).toHaveBeenCalledTimes(1);
    expect(sendSms.mock.calls[0][0]).toBe("05322222222");
    vi.unstubAllEnvs();
  });

  it("D-demo: yalnizCekiciIds development’ta tester olmayanı da bildirir", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SMS_TESTER_ONLY", "");
    const normal = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      kredi: 0,
      testerHesap: false,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([]);
    getCekiciById.mockResolvedValue(normal);
    const ids = await notifyCekiciler(
      talepFixture({
        konumIl: "İstanbul",
        konumIlce: "Kadıköy",
        yalnizCekiciId: "c1",
      }),
      "http://localhost:3000",
      [],
      { yalnizCekiciIds: ["c1"] }
    );
    expect(ids).toEqual(["c1"]);
    expect(sendSms).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});

describe("E — Müşteri SMS (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendSms.mockResolvedValue({ basarili: true, saglayici: "mock" });
  });

  it("E1: talep_alindi OTP + buradan gorebilirsiniz + sesli", async () => {
    const t = talepFixture({ id: "t1" });
    await notifyMusteri(t, "talep_alindi", "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    const meta = sendSms.mock.calls[0][2] as { kanal?: string };
    expect(mesaj).toContain("Talebiniz alindi");
    expect(mesaj).toContain("Teklifleri buradan gorebilirsiniz");
    expect(mesaj).toContain("/bekle/t1");
    expect(meta.kanal).toBe("otp");
    expect(sesliMesajFireAndForget).toHaveBeenCalledWith(
      "musteri_talep_alindi",
      t.telefon,
      expect.stringContaining("t1"),
      expect.objectContaining({ relationid: expect.stringContaining("t1") })
    );
  });

  it("E1b: talep_alindi SMS fail → sesli yok", async () => {
    sendSms.mockResolvedValue({
      basarili: false,
      saglayici: "mock",
      hata: "Netgsm yapılandırılmamış",
    });
    await notifyMusteri(
      talepFixture({ id: "t1x" }),
      "talep_alindi",
      "http://localhost:3000"
    );
    expect(sesliMesajFireAndForget).not.toHaveBeenCalled();
  });

  it("E2: cekici_bulundu — SMS yok", async () => {
    await notifyMusteri(talepFixture(), "cekici_bulundu", "http://localhost:3000");
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("E3: yeniden_arama — SMS yok", async () => {
    await notifyMusteri(talepFixture({ id: "t2" }), "yeniden_arama", "http://localhost:3000");
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("E4: anlasildi — SMS yok", async () => {
    await notifyMusteri(talepFixture(), "anlasildi", "http://localhost:3000");
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("E5: yeni_teklif OTP", async () => {
    await notifyMusteri(talepFixture({ id: "t9" }), "yeni_teklif", "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    const meta = sendSms.mock.calls[0][2] as { kanal?: string };
    expect(mesaj).toContain("Teklif geldi");
    expect(mesaj).toContain("Buradan gorebilirsiniz");
    expect(mesaj).toContain("/bekle/t9");
    expect(meta.kanal).toBe("otp");
  });
});
