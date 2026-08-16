import { randomBytes, scryptSync } from "node:crypto";

const KEYLEN = 32;
const N = 16384;
const R = 8;
const P = 1;

/** `scrypt$N$r$p$salt$hash` — src/lib/sifre-hash.ts ile aynı format */
export function sifreHashle(sifre) {
  const salt = randomBytes(16);
  const hash = scryptSync(sifre, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function sifreHashMi(deger) {
  return typeof deger === "string" && deger.startsWith("scrypt$") && deger.split("$").length === 6;
}
