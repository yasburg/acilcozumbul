import type { NextRequest } from "next/server";
import { createHash } from "crypto";

/** İstek IP (proxy / Railway / Vercel uyumlu) */
export function istekIp(request: NextRequest | Request): string | null {
  const h = request.headers;
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const ilk = forwarded.split(",")[0]?.trim();
    if (ilk) return ilk;
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  return null;
}

export function ipHash(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
