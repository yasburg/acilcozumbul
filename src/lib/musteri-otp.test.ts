import { describe, expect, it, vi } from "vitest";
import { otpDogrula, otpGonder } from "./musteri-otp";

const mockOtpStore = new Map<string, any>();

vi.mock("./supabase/admin", () => ({
  getSupabaseAdmin: () => ({
    from: (table: string) => {
      if (table !== "telefon_otp") throw new Error("Unknown table");
      return {
        select: () => ({
          eq: (_col: string, val: string) => ({
            maybeSingle: async () => {
              const item = mockOtpStore.get(val);
              return { data: item ? { ...item } : null, error: null };
            },
          }),
        }),
        upsert: async (row: any) => {
          mockOtpStore.set(row.telefon, { ...row });
          return { data: row, error: null };
        },
        delete: () => ({
          eq: (_col: string, val: string) => ({
            lt: async () => ({ error: null }),
          }),
        }),
      };
    },
  }),
}));

describe("musteri-otp logic", () => {
  it("generates OTP code and verifies successfully for new phone numbers", async () => {
    mockOtpStore.clear();
    const phone = "05321234567";

    const sendRes = await otpGonder(phone);
    expect(sendRes.ok).toBe(true);
    if (!sendRes.ok) return;

    expect(sendRes.kod).toHaveLength(6);

    const verifyRes = await otpDogrula(phone, sendRes.kod);
    expect(verifyRes.ok).toBe(true);
    if (!verifyRes.ok) return;
    expect(verifyRes.telefon).toBe(phone);
  });

  it("returns zatenDogrulandi when phone is already verified today", async () => {
    mockOtpStore.clear();
    const phone = "05559876543";

    // 1. Initial send & verify
    const send1 = await otpGonder(phone);
    expect(send1.ok).toBe(true);
    if (!send1.ok) return;
    await otpDogrula(phone, send1.kod);

    // 2. Next request on the same day detects phone is already verified
    const send2 = await otpGonder(phone);
    expect(send2.ok).toBe(true);
    if (send2.ok) {
      expect((send2 as any).zatenDogrulandi).toBe(true);
    }
  });

  it("returns success if otpDogrula is re-called on an already verified phone number today", async () => {
    mockOtpStore.clear();
    const phone = "05441112233";

    const sendRes = await otpGonder(phone);
    expect(sendRes.ok).toBe(true);
    if (!sendRes.ok) return;

    const verifyRes1 = await otpDogrula(phone, sendRes.kod);
    expect(verifyRes1.ok).toBe(true);

    // Calling otpDogrula again on an already verified record returns success instead of "Kod bulunamadı" error
    const verifyRes2 = await otpDogrula(phone, sendRes.kod);
    expect(verifyRes2.ok).toBe(true);
    if (verifyRes2.ok) {
      expect(verifyRes2.telefon).toBe(phone);
    }
  });
});
