import { randomBytes } from "crypto";
import type { Cekici } from "./types";
import { telefonNormalize } from "./telefon";
import { sifreHashDogrula, sifreHashle, bcryptHashMi } from "./sifre-hash";
import { getCekiciByTelefon, getCekiciler, updateCekici } from "./db";

/** Auth e-posta kimliği (telefon → geçerli e-posta formatı) */
export function cekiciAuthEmail(telefonHam: string): string {
  const tel = telefonNormalize(telefonHam);
  return `${tel}@cekici.acilcozumbul.internal`;
}

/** Kullanıcıya gösterilmeyen rastgele parola (passwordless kayıt) */
export function cekiciAuthRastgeleSifre(): string {
  return randomBytes(24).toString("base64url");
}

export async function cekiciAuthKullaniciOlustur(input: {
  telefon: string;
  sifre: string;
  cekiciId: string;
  ad?: string;
}): Promise<string> {
  return input.cekiciId;
}

export async function cekiciAuthSifreGuncelle(
  cekici: Cekici,
  sifre: string
): Promise<Cekici> {
  return cekiciSifreyiAuthaTasi(cekici, sifre);
}

export async function cekiciAuthKullaniciSil(
  _authUserId: string
): Promise<void> {
  // Auth kullanıcı tablosu yok; çekici satırı ayrı silinir
}

export async function cekiciAuthSifreDogrula(
  telefon: string,
  sifre: string
): Promise<boolean> {
  const cekici = await getCekiciByTelefon(telefonNormalize(telefon));
  if (!cekici) return false;
  return cekiciGirisSifreKontrol(cekici, sifre);
}

export async function cekiciSifreyiAuthaTasi(
  cekici: Cekici,
  sifre: string
): Promise<Cekici> {
  const sifreHash = sifreHashle(sifre);
  const guncel: Cekici = { ...cekici, sifre: "", sifreHash };
  await updateCekici(guncel);
  return guncel;
}

/**
 * Düz metin şifreyi hash'e çevirir; hash varken düz metni siler.
 * İkisi de yoksa rastgele (girilemeyen) bir hash yazar.
 */
export function cekiciSifreKayitiniGuvenliyeAl(cekici: Cekici): Cekici {
  if (cekici.sifreHash) {
    return cekici.sifre ? { ...cekici, sifre: "" } : cekici;
  }
  if (cekici.sifre) {
    return { ...cekici, sifre: "", sifreHash: sifreHashle(cekici.sifre) };
  }
  return {
    ...cekici,
    sifre: "",
    sifreHash: sifreHashle(cekiciAuthRastgeleSifre()),
  };
}

/** Hash'siz veya düz metin kalan çekici satırlarını scrypt'e çevirir. */
export async function cekiciSifreHashleriniTasi(): Promise<number> {
  const liste = await getCekiciler();
  let n = 0;
  for (const c of liste) {
    const guncel = cekiciSifreKayitiniGuvenliyeAl(c);
    if (guncel.sifre !== c.sifre || guncel.sifreHash !== c.sifreHash) {
      await updateCekici(guncel);
      n += 1;
    }
  }
  return n;
}

/**
 * Giriş doğrulama: hash varsa onu kullan; yoksa tek seferlik plaintext rehash.
 * Hash yok ve plaintext eşleşmezse reddet.
 */
export async function cekiciGirisSifreKontrol(
  cekici: Cekici,
  sifre: string
): Promise<boolean> {
  if (!sifre) return false;
  if (cekici.sifreHash) {
    const ok = sifreHashDogrula(sifre, cekici.sifreHash);
    if (ok && bcryptHashMi(cekici.sifreHash)) {
      await cekiciSifreyiAuthaTasi(cekici, sifre);
    }
    return ok;
  }
  if (cekici.sifre && cekici.sifre === sifre) {
    await cekiciSifreyiAuthaTasi(cekici, sifre);
    return true;
  }
  return false;
}
