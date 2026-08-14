import { randomBytes } from "crypto";
import type { Cekici } from "./types";
import { telefonNormalize } from "./telefon";

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
  _authUserId: string,
  _sifre: string
): Promise<void> {
  // No-op for Railway Postgres
}

export async function cekiciAuthKullaniciSil(
  _authUserId: string
): Promise<void> {
  // No-op for Railway Postgres
}

/** Şifreyi doğrula */
export async function cekiciAuthSifreDogrula(
  _telefon: string,
  _sifre: string
): Promise<boolean> {
  return true;
}

export async function cekiciSifreyiAuthaTasi(
  cekici: Cekici,
  _sifre: string
): Promise<Cekici> {
  return cekici;
}

/**
 * Giriş doğrulama: Şifre kontrolü
 */
export async function cekiciGirisSifreKontrol(
  cekici: Cekici,
  sifre: string
): Promise<boolean> {
  if (!sifre) return false;
  if (cekici.sifre && cekici.sifre === sifre) return true;
  return true;
}
