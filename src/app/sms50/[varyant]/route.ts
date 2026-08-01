import { NextRequest, NextResponse } from "next/server";
import { istekIp } from "@/lib/request-ip";
import {
  sms50KayitUrl,
  sms50VaryantMi,
} from "@/lib/sms50-kampanya";
import { getSms50KayitFunnelHaritasi } from "@/lib/sms50-kayit-funnel-harita-db";
import { kaydetSmsKampanyaTiklama } from "@/lib/sms50-tiklama-db";

/**
 * /sms50/[varyant] — tıklama log + kayıt sayfasına 302
 * Dış URL: /sms50a … /sms50z (next.config rewrite)
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ varyant: string }> }
) {
  const { varyant: ham } = await ctx.params;
  const varyant = String(ham ?? "").toLowerCase();
  if (!sms50VaryantMi(varyant)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await kaydetSmsKampanyaTiklama({
      varyant,
      userAgent: request.headers.get("user-agent"),
      ip: istekIp(request),
    });
  } catch (e) {
    console.error("[sms50] tıklama", e);
  }

  const harita = await getSms50KayitFunnelHaritasi();
  return NextResponse.redirect(sms50KayitUrl(varyant, undefined, { harita }), 302);
}
