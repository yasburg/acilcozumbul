import { NextRequest, NextResponse } from "next/server";
import { istekIp } from "@/lib/request-ip";
import { smsBaseUrl } from "@/lib/sms-base-url";
import {
  sms50KayitUrl,
  sms50TokenGecerliMi,
  sms50VaryantMi,
} from "@/lib/sms50-kampanya";
import { kaydetSmsKampanyaTiklama } from "@/lib/sms50-tiklama-db";
import {
  getSms50LinkToken,
  kaydetSms50TokenTiklama,
} from "@/lib/sms50-token";

/**
 * /sms50/[varyant]/[token] — kişiye özel tıklama + kayıt 302
 * Dış URL: /sms50a/xK7m2pQ9 (next.config rewrite)
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ varyant: string; token: string }> }
) {
  const { varyant: ham, token: tokenHam } = await ctx.params;
  const varyant = String(ham ?? "").toLowerCase();
  const token = String(tokenHam ?? "");

  if (!sms50VaryantMi(varyant) || !sms50TokenGecerliMi(token)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const kayit = await getSms50LinkToken(token);
  if (!kayit || kayit.varyant !== varyant) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await kaydetSms50TokenTiklama(token);
    await kaydetSmsKampanyaTiklama({
      varyant,
      kampanyaKodu: kayit.kampanyaKodu,
      userAgent: request.headers.get("user-agent"),
      ip: istekIp(request),
    });
  } catch (e) {
    console.error("[sms50-token] tıklama", e);
  }

  /* Proxy/Host localhost gelebilir — SMS kayıt linki her zaman canlı domain */
  const base = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  return NextResponse.redirect(
    sms50KayitUrl(varyant, base, { smsToken: token }),
    302
  );
}
