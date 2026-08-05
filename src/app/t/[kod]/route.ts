import { NextRequest, NextResponse } from "next/server";
import { smsBaseUrl } from "@/lib/sms-base-url";
import {
  getSmsTalepKisaLink,
  kaydetSmsTalepKisaLinkTiklama,
  smsTalepKisaTokenGecerliMi,
  smsTalepUzunUrl,
} from "@/lib/sms-talep-kisa-link";

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

  try {
    await kaydetSmsTalepKisaLinkTiklama(token);
  } catch (e) {
    console.error("[sms-talep-kisa] tıklama", e);
  }

  const base = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  return NextResponse.redirect(
    smsTalepUzunUrl(kayit.talepId, kayit.cekiciToken, base),
    302
  );
}
