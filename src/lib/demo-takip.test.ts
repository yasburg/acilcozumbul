import { describe, expect, it } from "vitest";
import { cekiciAcikTalepUygunMu } from "./ihale";
import { demoTakipGecikmeMs, demoTakipTalepOlustur } from "./demo-takip";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

describe("demoTakipGecikmeMs", () => {
  it("varsayılan 1 dakika", () => {
    const prev = process.env.DEMO_TAKIP_GECIKME_MS;
    delete process.env.DEMO_TAKIP_GECIKME_MS;
    expect(demoTakipGecikmeMs()).toBe(60_000);
    if (prev !== undefined) process.env.DEMO_TAKIP_GECIKME_MS = prev;
  });
});

describe("demoTakipTalepOlustur", () => {
  it("yalnızca hedef çekiciye kilitler", () => {
    const c = cekiciFixture({ id: "demo-c1", sehir: "İstanbul" });
    const t = demoTakipTalepOlustur({ cekici: c, talepId: "t1" });
    expect(t.yalnizCekiciId).toBe("demo-c1");
    expect(t.memnuniyetSmsGonderildi).toBe(true);
  });
});

describe("cekiciAcikTalepUygunMu + yalnizCekiciId", () => {
  it("başka çekiciyi dışlar", () => {
    const hedef = cekiciFixture({ id: "c1", sehir: "İstanbul" });
    const diger = cekiciFixture({ id: "c2", sehir: "İstanbul" });
    const t = talepFixture({
      yalnizCekiciId: "c1",
      konumIl: "İstanbul",
      konumIlce: hedef.hizmetIlceleri?.[0] ?? "Kadıköy",
    });
    expect(cekiciAcikTalepUygunMu(t, hedef)).toBe(true);
    expect(cekiciAcikTalepUygunMu(t, diger)).toBe(false);
  });
});
