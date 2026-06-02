import type { NextRequest } from "next/server";

export function istemciIpAl(request: NextRequest): string {
  let ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "192.168.0.1";

  if (ip === "::1") ip = "127.0.0.1";
  if (ip === "127.0.0.1" || ip === "localhost") ip = "192.168.0.1";
  return ip;
}
