import { beforeEach, describe, expect, it } from "vitest";
import {
  getSmsTalepKisaLink,
  kaydetSmsTalepKisaLinkTiklama,
  olusturSmsTalepKisaLink,
  smsTalepKisaLinkBellekTemizle,
  smsTalepKisaTokenGecerliMi,
  smsTalepKisaUrl,
  smsTalepUzunUrl,
} from "./sms-talep-kisa-link";

describe("sms-talep-kisa-link", () => {
  beforeEach(() => {
    smsTalepKisaLinkBellekTemizle();
  });

  it("token formatını doğrular", () => {
    expect(smsTalepKisaTokenGecerliMi("Aa0Bb1Cc")).toBe(true);
    expect(smsTalepKisaTokenGecerliMi("short")).toBe(false);
  });

  it("bellekte kısa link üretir ve aynı talep+çekici için yeniden kullanır", async () => {
    const a = await olusturSmsTalepKisaLink({
      talepId: "t1",
      cekiciId: "c1",
      cekiciToken: "tok-1",
    });
    const b = await olusturSmsTalepKisaLink({
      talepId: "t1",
      cekiciId: "c1",
      cekiciToken: "tok-1",
    });
    expect(a.token).toBe(b.token);
    expect(smsTalepKisaTokenGecerliMi(a.token)).toBe(true);

    const okunan = await getSmsTalepKisaLink(a.token);
    expect(okunan?.talepId).toBe("t1");
    expect(okunan?.cekiciToken).toBe("tok-1");

    await kaydetSmsTalepKisaLinkTiklama(a.token);
    const tik = await getSmsTalepKisaLink(a.token);
    expect(tik?.tiklamaSayisi).toBe(1);
    expect(tik?.ilkTiklama).toBeTruthy();
  });

  it("kısa ve uzun URL üretir", () => {
    expect(smsTalepKisaUrl("Aa0Bb1Cc", "https://www.acilcozumbul.com")).toBe(
      "https://www.acilcozumbul.com/t/Aa0Bb1Cc"
    );
    expect(
      smsTalepUzunUrl("t1", "https://www.acilcozumbul.com/")
    ).toBe("https://www.acilcozumbul.com/cekici/talep/t1");
  });
});
