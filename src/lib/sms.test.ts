import { beforeEach, describe, expect, it, vi } from "vitest";
import { notifyCekiciler, notifyMusteri } from "./sms";
import {
  PANEL_BILDIRIM_KREDI,
  PREMIUM_SMS_BILDIRIM_KREDI,
} from "./ihale";
import { cekiciFixture, talepFixture } from "@/test/fixtures";
import type { Cekici } from "./types";

const getCekiciler = vi.fn();
const getCekiciById = vi.fn();
const updateCekici = vi.fn();
const sendSms = vi.fn();

vi.mock("./db", () => ({
  getCekiciler: (...args: unknown[]) => getCekiciler(...args),
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
      const list = getCekiciler.mock.results.at(-1)?.value;
      if (Array.isArray(list)) {
        return list.find((c: Cekici) => c.id === id) ?? null;
      }
      const resolved = await Promise.resolve(getCekiciler.mock.results[0]?.value);
      if (Array.isArray(resolved)) {
        return resolved.find((c: Cekici) => c.id === id) ?? null;
      }
      return null;
    });
  });

  it("D1: 2 uygun çekici — panel (SMS yok, 1 kredi)", async () => {
    const c1 = cekiciFixture({ id: "c1", telefon: "05321111111" });
    const c2 = cekiciFixture({ id: "c2", telefon: "05322222222" });
    const c3 = cekiciFixture({
      id: "c3",
      hizmetBolgeleri: { İstanbul: ["Beşiktaş"] },
    });
    getCekiciler.mockResolvedValue([c1, c2, c3]);
    getCekiciById.mockImplementation(async (id: string) =>
      [c1, c2, c3].find((c) => c.id === id) ?? null
    );
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    const ids = await notifyCekiciler(t, "http://localhost:3000");
    expect(ids.sort()).toEqual(["c1", "c2"]);
    expect(sendSms).not.toHaveBeenCalled();
    expect(updateCekici).toHaveBeenCalledTimes(2);
  });

  it("D1b: premium SMS → anlık SMS + 2 kredi meta", async () => {
    const c1 = cekiciFixture({
      id: "c1",
      telefon: "05321111111",
      premiumSmsAktif: true,
      kredi: 5,
    });
    getCekiciler.mockResolvedValue([c1]);
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
    getCekiciler.mockResolvedValue([
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
    getCekiciler.mockResolvedValue([
      cekiciFixture({ id: "c1", kredi: PANEL_BILDIRIM_KREDI - 0.5 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D5: kredi 0 → bildirim yok", async () => {
    getCekiciler.mockResolvedValue([cekiciFixture({ id: "c1", kredi: 0 })]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D6: haric tutulan çekiciye yeniden arama gitmez", async () => {
    const c1 = cekiciFixture({ id: "c1" });
    const c2 = cekiciFixture({ id: "c2" });
    getCekiciler.mockResolvedValue([c1, c2]);
    getCekiciById.mockImplementation(async (id: string) =>
      [c1, c2].find((c) => c.id === id) ?? null
    );
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    await notifyCekiciler(t, "http://localhost:3000", ["c1"], {
      yenidenArama: true,
    });
    expect(updateCekici).toHaveBeenCalledTimes(1);
    expect(sendSms).not.toHaveBeenCalled();
  });

  it("D7: premium yeniden arama mesajı", async () => {
    getCekiciler.mockResolvedValue([
      cekiciFixture({ premiumSmsAktif: true, kredi: 5 }),
    ]);
    await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000",
      [],
      { yenidenArama: true }
    );
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("yeni çekici arıyor");
  });

  it("D8: premium ilk talep mesajı ve token linki", async () => {
    const c = cekiciFixture({
      token: "abc-token",
      premiumSmsAktif: true,
      kredi: 5,
    });
    getCekiciler.mockResolvedValue([c]);
    const t = talepFixture({
      id: "t99",
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
    });
    await notifyCekiciler(t, "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("yolda kaldı");
    expect(mesaj).toContain("t=abc-token");
    expect(mesaj).toContain("/cekici/talep/t99");
  });

  it("D9: premium altyapı hatası → panelde açık sayılır", async () => {
    sendSms.mockResolvedValue({
      basarili: false,
      saglayici: "mock",
      hata: "Netgsm yapılandırılmamış",
    });
    getCekiciler.mockResolvedValue([
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
    getCekiciler.mockResolvedValue([
      cekiciFixture({ id: "c1", premiumSmsAktif: true, kredi: 5 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D10: çok sayıda uygun çekici — panele bildir", async () => {
    const list: Cekici[] = Array.from({ length: 5 }, (_, i) =>
      cekiciFixture({ id: `c${i}`, telefon: `0532000000${i}` })
    );
    getCekiciler.mockResolvedValue(list);
    getCekiciById.mockImplementation(
      async (id: string) => list.find((c) => c.id === id) ?? null
    );
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toHaveLength(5);
    expect(sendSms).not.toHaveBeenCalled();
    expect(updateCekici).toHaveBeenCalledTimes(5);
  });

  it("D4: kredi tam 1 — panel bildirimi dahil", async () => {
    const c1 = cekiciFixture({ id: "c1", kredi: 1 });
    getCekiciler.mockResolvedValue([c1]);
    getCekiciById.mockResolvedValue(c1);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual(["c1"]);
  });

  it("premium için 1 kredi yetersiz", async () => {
    getCekiciler.mockResolvedValue([
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

  it("E1: talep_alindi", async () => {
    const t = talepFixture({ id: "t1" });
    await notifyMusteri(t, "talep_alindi", "http://localhost:3000");
    expect(sendSms.mock.calls[0][1]).toContain("Talebiniz alındı");
    expect(sendSms.mock.calls[0][1]).toContain("/bekle/t1");
  });

  it("E2: cekici_bulundu", async () => {
    await notifyMusteri(talepFixture(), "cekici_bulundu", "http://localhost:3000");
    expect(sendSms.mock.calls[0][1]).toContain("Çekici seçtiniz");
  });

  it("E3: yeniden_arama", async () => {
    await notifyMusteri(talepFixture(), "yeniden_arama", "http://localhost:3000");
    expect(sendSms.mock.calls[0][1]).toContain("Yeni çekici aranıyor");
  });

  it("E4: anlasildi", async () => {
    await notifyMusteri(talepFixture(), "anlasildi", "http://localhost:3000");
    expect(sendSms.mock.calls[0][1]).toContain("anlaşmanız kaydedildi");
  });
});
