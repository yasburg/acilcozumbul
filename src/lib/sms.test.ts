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

vi.mock("./db", () => ({
  getCekicilerBildirimAdaylari: (...args: unknown[]) => getCekicilerBildirimAdaylari(...args),
  getCekiciById: (...args: unknown[]) => getCekiciById(...args),
  updateCekici: (...args: unknown[]) => updateCekici(...args),
}));

vi.mock("./sms-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./sms-provider")>();
  return {
    ...actual,
    sendSms: (...args: unknown[]) => sendSms(...args),
  };
});

describe("D — Çekici bildirim (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendSms.mockResolvedValue({ basarili: true, saglayici: "mock" });
    updateCekici.mockResolvedValue(undefined);
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

  it("D1: varsayılan premium — OTP SMS + 2 kredi", async () => {
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
    expect(meta.krediMiktar).toBe(PREMIUM_SMS_BILDIRIM_KREDI);
    expect(meta.kanal).toBe("otp");
  });

  it("D1a: premium kapalı → toplu SMS + 1 kredi", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
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
  });

  it("D1b: premium SMS → anlık SMS + 2 kredi meta", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      premiumSmsAktif: true,
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

  it("D7: premium yeniden arama mesajı", async () => {
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
    expect(mesaj).toContain("yeni cekici ariyor");
  });

  it("D8: premium ilk talep mesajı ve token linki", async () => {
    const c = cekiciFixture({
      token: "abc-token",
      premiumSmsAktif: true,
      kredi: 5,
    });
    getCekicilerBildirimAdaylari.mockResolvedValue([c]);
    const t = talepFixture({
      id: "t99",
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
    });
    await notifyCekiciler(t, "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("yolda kaldi");
    expect(mesaj).toContain("[Kadıköy]");
    expect(mesaj).toContain("t=abc-token");
    expect(mesaj).toContain("/cekici/talep/t99");
    expect(mesaj).not.toMatch(/\([^)]{20,}\)/);
  });

  it("D9: premium altyapı hatası → panelde açık sayılır", async () => {
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
  });

  it("D9b: yetersiz kredi hatası → bildirilenIds'e eklenmez", async () => {
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
      krediMiktar: PREMIUM_SMS_BILDIRIM_KREDI,
    });
  });

  it("D4: premium kapalı + kredi 1 — toplu SMS dahil", async () => {
    const c1 = cekiciFixture({ id: "c1", kredi: 1, premiumSmsAktif: false });
    getCekicilerBildirimAdaylari.mockResolvedValue([c1]);
    getCekiciById.mockResolvedValue(c1);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual(["c1"]);
  });

  it("premium için 1 kredi yetersiz", async () => {
    getCekicilerBildirimAdaylari.mockResolvedValue([
      cekiciFixture({ id: "c1", kredi: 1, premiumSmsAktif: true }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
    expect(sendSms).not.toHaveBeenCalled();
  });
});

describe("E — Müşteri SMS (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendSms.mockResolvedValue({ basarili: true, saglayici: "mock" });
  });

  it("E1: talep_alindi OTP + buradan gorebilirsiniz", async () => {
    const t = talepFixture({ id: "t1" });
    await notifyMusteri(t, "talep_alindi", "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    const meta = sendSms.mock.calls[0][2] as { kanal?: string };
    expect(mesaj).toContain("Talebiniz alindi");
    expect(mesaj).toContain("Teklifleri buradan gorebilirsiniz");
    expect(mesaj).toContain("/bekle/t1");
    expect(meta.kanal).toBe("otp");
  });

  it("E2: cekici_bulundu — SMS yok", async () => {
    await notifyMusteri(talepFixture(), "cekici_bulundu", "http://localhost:3000");
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("E3: yeniden_arama OTP", async () => {
    await notifyMusteri(talepFixture({ id: "t2" }), "yeniden_arama", "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    const meta = sendSms.mock.calls[0][2] as { kanal?: string };
    expect(mesaj).toContain("Yeni cekici araniyor");
    expect(mesaj).toContain("/bekle/t2");
    expect(meta.kanal).toBe("otp");
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
