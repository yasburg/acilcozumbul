import { NextRequest, NextResponse } from "next/server";
import {
  getKrediHatirlatmaByToken,
  kaydetKrediHatirlatmaTiklama,
} from "@/lib/kredi-hatirlatma-db";
import { krediHatirlatmaTokenGecerliMi } from "@/lib/kredi-hatirlatma";
import { smsBaseUrl } from "@/lib/sms-base-url";

/**
 * /kredi-hatirlatma/[token] — tıklama kaydı + /cekici/kredi 302
 * Dış URL: /kr/xK7m2pQ9 (next.config rewrite)
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token: tokenHam } = await ctx.params;
  const token = String(tokenHam ?? "");

  if (!krediHatirlatmaTokenGecerliMi(token)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const kayit = await getKrediHatirlatmaByToken(token);
  if (!kayit) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await kaydetKrediHatirlatmaTiklama(token);
  } catch (e) {
    console.error("[kredi-hatirlatma] tıklama", e);
  }

  const base = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  return NextResponse.redirect(
    `${base}/cekici/kredi?kh=${encodeURIComponent(token)}`,
    302
  );
}
