import { NextRequest, NextResponse } from "next/server";
import { smsBaseUrl } from "@/lib/sms-base-url";
import {
  getSmsTalepKisaLink,
  kaydetSmsTalepKisaLinkTiklama,
  smsTalepKisaTokenGecerliMi,
  smsTalepUzunUrl,
} from "@/lib/sms-talep-kisa-link";
import { getCekiciByToken } from "@/lib/db";
import { CEKICI_COOKIE, cekiciOturumCookieAyarlari } from "@/lib/auth";

/**
 * /t/{token} — çekici talep SMS kısa linki → ihale sayfası
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ kod: string }> }
) {
  const { kod: ham } = await ctx.params;
  const token = String(ham ?? "");

  if (!smsTalepKisaTokenGecerliMi(token)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const kayit = await getSmsTalepKisaLink(token);
  if (!kayit) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const cekici = await getCekiciByToken(kayit.cekiciToken);
  if (!cekici?.aktif) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    await kaydetSmsTalepKisaLinkTiklama(token);
  } catch (e) {
    console.error("[sms-talep-kisa] tıklama", e);
  }

  const base = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  const response = NextResponse.redirect(
    smsTalepUzunUrl(kayit.talepId, base),
    302
  );
  response.cookies.set(
    CEKICI_COOKIE,
    kayit.cekiciToken,
    cekiciOturumCookieAyarlari(true)
  );
  return response;
}
