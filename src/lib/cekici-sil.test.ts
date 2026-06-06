import { beforeEach, describe, expect, it, vi } from "vitest";
import { cekiciFixture } from "@/test/fixtures";

const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();

vi.mock("./db", () => ({
  getCekiciById: vi.fn(),
}));

vi.mock("./supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: mockFrom,
    storage: { from: mockStorageFrom },
  }),
}));

import { getCekiciById } from "./db";
import { silCekiciCascade } from "./cekici-sil";

function chainable(result: { error: unknown } = { error: null }) {
  const chain = {
    delete: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    or: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (v: typeof result) => void) => resolve(result),
  };
  return chain;
}

describe("silCekiciCascade", () => {
  beforeEach(() => {
    vi.mocked(getCekiciById).mockReset();
    mockFrom.mockReset();
    mockStorageFrom.mockReset();
  });

  it("çekici yoksa hata verir", async () => {
    vi.mocked(getCekiciById).mockResolvedValue(undefined);
    await expect(silCekiciCascade("yok")).rejects.toThrow("Çekici bulunamadı.");
  });

  it("ilişkili tabloları temizleyip çekiciyi siler", async () => {
    vi.mocked(getCekiciById).mockResolvedValue(
      cekiciFixture({ id: "c-1", telefon: "05321111111" })
    );

    mockFrom.mockImplementation((table: string) => {
      if (table === "davet_kullanimlari") {
        return chainable();
      }
      if (table === "cekiciler") {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      };
    });

    mockStorageFrom.mockReturnValue({
      list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      remove: vi.fn(),
    });

    await silCekiciCascade("c-1");

    expect(mockFrom).toHaveBeenCalledWith("davet_kullanimlari");
    expect(mockFrom).toHaveBeenCalledWith("kredi_odemeler");
    expect(mockFrom).toHaveBeenCalledWith("sms_log");
    expect(mockFrom).toHaveBeenCalledWith("cekici_sifre_otp");
    expect(mockFrom).toHaveBeenCalledWith("cekiciler");
  });
});
