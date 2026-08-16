import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSim = vi.fn();
const mockMemnuniyet = vi.fn();
const mockIhale = vi.fn();
const mockTopluVar = vi.fn();
const mockToplu = vi.fn();

vi.mock("./sms-base-url", () => ({
  smsBaseUrl: (u: string) => u.replace(/\/$/, ""),
}));

vi.mock("./simulasyon-ihale-db", () => ({
  simulasyonCalistir: (...args: unknown[]) => mockSim(...args),
}));

vi.mock("./memnuniyet", () => ({
  topluMemnuniyetSmsGonder: (...args: unknown[]) => mockMemnuniyet(...args),
}));

vi.mock("./ihale-hatirlatma-db", () => ({
  isleIhaleHatirlatmalari: (...args: unknown[]) => mockIhale(...args),
}));

vi.mock("./toplu-sms-is-db", () => ({
  tetikleTopluSmsKuyruk: (...args: unknown[]) => mockToplu(...args),
}));

vi.mock("./supabase/toplu-sms-schema", () => ({
  topluSmsIsTablolariVar: () => mockTopluVar(),
}));

import { cronPeriyodikCalistir } from "./cron-periyodik";

describe("cronPeriyodikCalistir", () => {
  beforeEach(() => {
    mockSim.mockReset();
    mockMemnuniyet.mockReset();
    mockIhale.mockReset();
    mockTopluVar.mockReset();
    mockToplu.mockReset();
    mockSim.mockResolvedValue({ acilan: 1, kapanan: 0, hatalar: [] });
    mockMemnuniyet.mockResolvedValue(2);
    mockIhale.mockResolvedValue({
      talepIncelenen: 1,
      musteriGonderilen: 1,
      cekiciGonderilen: 0,
      atlanan: 0,
      hatalar: [],
    });
    mockTopluVar.mockResolvedValue(true);
    mockToplu.mockResolvedValue({ islenen: 0 });
  });

  it("simülasyon + memnuniyet + ihale + toplu SMS çalıştırır", async () => {
    const sonuc = await cronPeriyodikCalistir({
      baseUrl: "https://www.acilcozumbul.com",
    });
    expect(sonuc.sim.acilan).toBe(1);
    expect(sonuc.memnuniyet).toBe(2);
    expect(sonuc.ihale?.musteriGonderilen).toBe(1);
    expect(sonuc.topluSms).toEqual({ islenen: 0 });
    expect(sonuc.hatalar).toEqual([]);
  });

  it("bir iş patlasa diğerleri devam eder", async () => {
    mockMemnuniyet.mockRejectedValue(new Error("sms fail"));
    mockTopluVar.mockResolvedValue(false);
    const sonuc = await cronPeriyodikCalistir({
      baseUrl: "https://www.acilcozumbul.com",
    });
    expect(sonuc.sim.acilan).toBe(1);
    expect(sonuc.memnuniyet).toBe(0);
    expect(sonuc.topluSms).toBeNull();
    expect(sonuc.hatalar.some((h) => h.startsWith("memnuniyet:"))).toBe(true);
  });
});
