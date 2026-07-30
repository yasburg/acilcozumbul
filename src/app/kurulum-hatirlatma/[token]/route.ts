import { NextRequest, NextResponse } from "next/server";
import {
  getKurulumHatirlatmaByToken,
  kaydetKurulumHatirlatmaTiklama,
} from "@/lib/kurulum-hatirlatma-db";
import { kurulumHatirlatmaTokenGecerliMi } from "@/lib/kurulum-hatirlatma";
import { smsBaseUrl } from "@/lib/sms-base-url";

/**
 * /kurulum-hatirlatma/[token] — tıklama kaydı + /kayit/kurulum 302
 * Dış URL: /ku/xK7m2pQ9 (next.config rewrite)
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token: tokenHam } = await ctx.params;
  const token = String(tokenHam ?? "");

  if (!kurulumHatirlatmaTokenGecerliMi(token)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const kayit = await getKurulumHatirlatmaByToken(token);
  if (!kayit) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await kaydetKurulumHatirlatmaTiklama(token);
  } catch (e) {
    console.error("[kurulum-hatirlatma] tıklama", e);
  }

  const base = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  return NextResponse.redirect(
    `${base}/kayit/kurulum?ku=${encodeURIComponent(token)}`,
    302
  );
}
