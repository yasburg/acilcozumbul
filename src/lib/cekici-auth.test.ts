import { describe, expect, it, vi, beforeEach } from "vitest";
import { hashSync } from "bcryptjs";
import { cekiciFixture } from "@/test/fixtures";
import { bcryptHashMi, sifreHashDogrula, sifreHashle } from "./sifre-hash";

vi.mock("./db", () => ({
  updateCekici: vi.fn(async () => {}),
  getCekiciByTelefon: vi.fn(),
}));

import { updateCekici } from "./db";
import {
  cekiciAuthEmail,
  cekiciGirisSifreKontrol,
  cekiciSifreyiAuthaTasi,
} from "./cekici-auth";

describe("cekiciAuthEmail", () => {
  it("telefonu Auth e-postasına çevirir", () => {
    expect(cekiciAuthEmail("0532 111 22 33")).toBe(
      "05321112233@cekici.acilcozumbul.internal"
    );
    expect(cekiciAuthEmail("5321112233")).toBe(
      "05321112233@cekici.acilcozumbul.internal"
    );
  });
});

describe("cekiciGirisSifreKontrol", () => {
  beforeEach(() => {
    vi.mocked(updateCekici).mockClear();
  });

  it("hash eşleşirse kabul eder, yanlış şifreyi reddeder", async () => {
    const sifreHash = sifreHashle("gizli-sifre");
    const cekici = cekiciFixture({ sifre: "", sifreHash });
    expect(await cekiciGirisSifreKontrol(cekici, "gizli-sifre")).toBe(true);
    expect(await cekiciGirisSifreKontrol(cekici, "yanlis")).toBe(false);
    expect(updateCekici).not.toHaveBeenCalled();
  });

  it("hash yoksa ve düz metin yoksa reddeder", async () => {
    const cekici = cekiciFixture({ sifre: "", sifreHash: undefined });
    expect(await cekiciGirisSifreKontrol(cekici, "herhangi")).toBe(false);
  });

  it("hash yok + legacy plaintext eşleşirse bir kez rehash yazar", async () => {
    const cekici = cekiciFixture({ sifre: "eski123", sifreHash: undefined });
    expect(await cekiciGirisSifreKontrol(cekici, "eski123")).toBe(true);
    expect(updateCekici).toHaveBeenCalledTimes(1);
    const kayit = vi.mocked(updateCekici).mock.calls[0]![0];
    expect(kayit.sifre).toBe("");
    expect(sifreHashDogrula("eski123", kayit.sifreHash)).toBe(true);
  });

  it("hash varken düz metin artık kullanılmaz", async () => {
    const sifreHash = sifreHashle("gercek");
    const cekici = cekiciFixture({ sifre: "gercek", sifreHash });
    expect(await cekiciGirisSifreKontrol(cekici, "gercek")).toBe(true);
    expect(await cekiciGirisSifreKontrol(cekici, "baska")).toBe(false);
  });

  it("Supabase bcrypt hash doğrular ve scrypt'e çevirir", async () => {
    const bcryptHash = hashSync("eski-sifre", 4);
    expect(bcryptHashMi(bcryptHash)).toBe(true);
    const cekici = cekiciFixture({ sifre: "", sifreHash: bcryptHash });
    expect(await cekiciGirisSifreKontrol(cekici, "eski-sifre")).toBe(true);
    expect(updateCekici).toHaveBeenCalledTimes(1);
    const kayit = vi.mocked(updateCekici).mock.calls[0]![0];
    expect(kayit.sifre).toBe("");
    expect(sifreHashDogrula("eski-sifre", kayit.sifreHash)).toBe(true);
    expect(bcryptHashMi(kayit.sifreHash)).toBe(false);
    expect(await cekiciGirisSifreKontrol(cekici, "yanlis")).toBe(false);
  });
});

describe("cekiciSifreyiAuthaTasi", () => {
  beforeEach(() => {
    vi.mocked(updateCekici).mockClear();
  });

  it("hash yazar ve düz metni siler", async () => {
    const cekici = cekiciFixture({ sifre: "eski", sifreHash: undefined });
    const guncel = await cekiciSifreyiAuthaTasi(cekici, "yeniSifre1");
    expect(guncel.sifre).toBe("");
    expect(sifreHashDogrula("yeniSifre1", guncel.sifreHash)).toBe(true);
    expect(updateCekici).toHaveBeenCalledWith(
      expect.objectContaining({ id: cekici.id, sifre: "" })
    );
  });
});
