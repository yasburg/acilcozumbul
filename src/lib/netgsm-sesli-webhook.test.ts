import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getCekiciById = vi.fn();
const getCekiciByTelefon = vi.fn();
const updateCekici = vi.fn();

vi.mock("./db", () => ({
  getCekiciById: (...args: unknown[]) => getCekiciById(...args),
  getCekiciByTelefon: (...args: unknown[]) => getCekiciByTelefon(...args),
  updateCekici: (...args: unknown[]) => updateCekici(...args),
}));

import {
  SESLI_DTMF_OTP_TUS,
  sesliRelationCekiciIdParse,
  sesliWebhookDtmfIsle,
  sesliWebhookPushButton,
  sesliWebhookSecretGecerliMi,
} from "./netgsm-sesli-webhook";
import { cekiciFixture } from "@/test/fixtures";

describe("sesliRelationCekiciIdParse", () => {
  it("t:…:c:… parse eder", () => {
    expect(sesliRelationCekiciIdParse("t:talep1:c:cekici9")).toBe("cekici9");
  });
  it("geçersizi reddeder", () => {
    expect(sesliRelationCekiciIdParse("musteri-talep:1")).toBeNull();
    expect(sesliRelationCekiciIdParse("")).toBeNull();
  });
});

describe("sesliWebhookPushButton", () => {
  it("detail.push_button okur", () => {
    expect(
      sesliWebhookPushButton({ detail: { push_button: 9 } })
    ).toBe(SESLI_DTMF_OTP_TUS);
  });
  it("üst düzey push_button okur", () => {
    expect(sesliWebhookPushButton({ push_button: "9" })).toBe(9);
  });
});

describe("sesliWebhookSecretGecerliMi", () => {
  const prev = process.env.NETGSM_VOICE_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.NETGSM_VOICE_WEBHOOK_SECRET = "gizli";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.NETGSM_VOICE_WEBHOOK_SECRET;
    else process.env.NETGSM_VOICE_WEBHOOK_SECRET = prev;
  });

  it("eşleşirse true", () => {
    expect(sesliWebhookSecretGecerliMi("gizli")).toBe(true);
    expect(sesliWebhookSecretGecerliMi("yanlis")).toBe(false);
  });
});

describe("sesliWebhookDtmfIsle", () => {
  beforeEach(() => {
    getCekiciById.mockReset();
    getCekiciByTelefon.mockReset();
    updateCekici.mockReset();
    updateCekici.mockResolvedValue(undefined);
  });

  it("tuş 9 → bildirimSeviye 2 (OTP)", async () => {
    const c = cekiciFixture({ id: "c1", bildirimSeviye: 3 });
    getCekiciById.mockResolvedValue(c);

    const r = await sesliWebhookDtmfIsle({
      relationid: "t:t1:c:c1",
      detail: { push_button: 9 },
    });

    expect(r.islem).toBe("otp_sms");
    expect(updateCekici).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "c1",
        bildirimSeviye: 2,
        premiumSmsAktif: true,
      })
    );
  });

  it("başka tuş → yok", async () => {
    const r = await sesliWebhookDtmfIsle({
      relationid: "t:t1:c:c1",
      detail: { push_button: 1 },
    });
    expect(r.islem).toBe("yok");
    expect(updateCekici).not.toHaveBeenCalled();
  });

  it("çekici yok → bulunamadi", async () => {
    getCekiciById.mockResolvedValue(undefined);
    getCekiciByTelefon.mockResolvedValue(undefined);
    const r = await sesliWebhookDtmfIsle({
      relationid: "t:t1:c:yok",
      callee: "5321234567",
      detail: { push_button: 9 },
    });
    expect(r.islem).toBe("bulunamadi");
  });
});
