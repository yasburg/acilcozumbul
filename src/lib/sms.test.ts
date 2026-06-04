import { beforeEach, describe, expect, it, vi } from "vitest";
import { notifyCekiciler, notifyMusteri } from "./sms";
import { SMS_BILDIRIM_KREDI } from "./ihale";
import { cekiciFixture, talepFixture } from "@/test/fixtures";
import type { Cekici } from "./types";

const getCekiciler = vi.fn();
const sendSms = vi.fn();

vi.mock("./db", () => ({
  getCekiciler: (...args: unknown[]) => getCekiciler(...args),
}));

vi.mock("./sms-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./sms-provider")>();
  return {
    ...actual,
    sendSms: (...args: unknown[]) => sendSms(...args),
  };
});

describe("D — Çekici SMS (mock)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendSms.mockResolvedValue({ basarili: true, saglayici: "mock" });
  });

  it("D1: 2 uygun çekiciye bildirim", async () => {
    const c1 = cekiciFixture({ id: "c1", telefon: "05321111111" });
    const c2 = cekiciFixture({ id: "c2", telefon: "05322222222" });
    const c3 = cekiciFixture({
      id: "c3",
      hizmetBolgeleri: { İstanbul: ["Beşiktaş"] },
    });
    getCekiciler.mockResolvedValue([c1, c2, c3]);
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    const ids = await notifyCekiciler(t, "http://localhost:3000");
    expect(ids.sort()).toEqual(["c1", "c2"]);
    expect(sendSms).toHaveBeenCalledTimes(2);
  });

  it("D2: aktif false → SMS yok", async () => {
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

  it("D3: kredi < SMS_BILDIRIM_KREDI → SMS yok", async () => {
    getCekiciler.mockResolvedValue([
      cekiciFixture({ id: "c1", kredi: SMS_BILDIRIM_KREDI - 0.5 }),
    ]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D5: kredi 0 → SMS yok", async () => {
    getCekiciler.mockResolvedValue([cekiciFixture({ id: "c1", kredi: 0 })]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D6: haric tutulan çekiciye yeniden arama SMS gitmez", async () => {
    const c1 = cekiciFixture({ id: "c1" });
    const c2 = cekiciFixture({ id: "c2" });
    getCekiciler.mockResolvedValue([c1, c2]);
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    await notifyCekiciler(t, "http://localhost:3000", ["c1"], {
      yenidenArama: true,
    });
    expect(sendSms).toHaveBeenCalledTimes(1);
    const tel = sendSms.mock.calls[0][0] as string;
    expect(tel).toBe(c2.telefon);
  });

  it("D7: yeniden arama mesajı", async () => {
    getCekiciler.mockResolvedValue([cekiciFixture()]);
    await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000",
      [],
      { yenidenArama: true }
    );
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("yeni çekici arıyor");
  });

  it("D8: ilk talep mesajı ve token linki", async () => {
    const c = cekiciFixture({ token: "abc-token" });
    getCekiciler.mockResolvedValue([c]);
    const t = talepFixture({ id: "t99", konumIl: "İstanbul", konumIlce: "Kadıköy" });
    await notifyCekiciler(t, "http://localhost:3000");
    const mesaj = sendSms.mock.calls[0][1] as string;
    expect(mesaj).toContain("yolda kaldı");
    expect(mesaj).toContain("t=abc-token");
    expect(mesaj).toContain("/cekici/talep/t99");
  });

  it("D9: altyapı hatası → panelde açık sayılır (kredi düşülmez)", async () => {
    sendSms.mockResolvedValue({
      basarili: false,
      saglayici: "mock",
      hata: "Netgsm yapılandırılmamış",
    });
    getCekiciler.mockResolvedValue([cekiciFixture({ id: "c1" })]);
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
      hata: "Yetersiz kredi (SMS bildirimi için 1 kredi gerekir)",
    });
    getCekiciler.mockResolvedValue([cekiciFixture({ id: "c1" })]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual([]);
  });

  it("D10: çok sayıda uygun çekici — hepsine SMS", async () => {
    const list: Cekici[] = Array.from({ length: 5 }, (_, i) =>
      cekiciFixture({ id: `c${i}`, telefon: `0532000000${i}` })
    );
    getCekiciler.mockResolvedValue(list);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toHaveLength(5);
    expect(sendSms).toHaveBeenCalledTimes(5);
  });

  it("D4: kredi tam 1 — filtre aşamasında dahil (provider kredi düşümü ayrı)", async () => {
    getCekiciler.mockResolvedValue([cekiciFixture({ id: "c1", kredi: 1 })]);
    const ids = await notifyCekiciler(
      talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" }),
      "http://localhost:3000"
    );
    expect(ids).toEqual(["c1"]);
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
