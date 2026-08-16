import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { compareSync } from "bcryptjs";

const KEYLEN = 32;
const N = 16384;
const R = 8;
const P = 1;

/** `scrypt$N$r$p$salt$hash` (salt ve hash base64url) */
export function sifreHashle(sifre: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(sifre, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function scryptHashMi(deger: string | null | undefined): boolean {
  if (!deger) return false;
  return deger.startsWith("scrypt$") && deger.split("$").length === 6;
}

/** Supabase Auth `encrypted_password` ($2a$ / $2b$ / $2y$) */
export function bcryptHashMi(deger: string | null | undefined): boolean {
  if (!deger) return false;
  const ham = deger.startsWith("bcrypt$") ? deger.slice(7) : deger;
  return /^\$2[aby]\$\d{2}\$/.test(ham);
}

export function sifreHashMi(deger: string | null | undefined): boolean {
  return scryptHashMi(deger) || bcryptHashMi(deger);
}

function bcryptHashNormalize(kayit: string): string {
  return kayit.startsWith("bcrypt$") ? kayit.slice(7) : kayit;
}

export function sifreHashDogrula(
  sifre: string,
  kayit: string | null | undefined
): boolean {
  if (!sifre || !kayit) return false;
  if (bcryptHashMi(kayit)) {
    try {
      return compareSync(sifre, bcryptHashNormalize(kayit));
    } catch {
      return false;
    }
  }
  if (!scryptHashMi(kayit)) return false;
  const parts = kayit.split("$");
  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }
  if (n < 2 || r < 1 || p < 1 || n > 1 << 20) return false;
  try {
    const salt = Buffer.from(parts[4]!, "base64url");
    const expected = Buffer.from(parts[5]!, "base64url");
    if (salt.length < 8 || expected.length < 16) return false;
    const derived = scryptSync(sifre, salt, expected.length, { N: n, r, p });
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
