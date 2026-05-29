import { NextRequest, NextResponse } from "next/server";
import { otpTemizle } from "@/lib/musteri-otp";
import {
  MUSTERI_TEL_COOKIE,
  musteriTelCookieTemizle,
} from "@/lib/musteri-auth";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const telefonHam = (body as { telefon?: string }).telefon ?? "";

  if (telefonHam && telefonGecerliMi(telefonHam)) {
    await otpTemizle(telefonHam);
  }

  const response = NextResponse.json({
    mesaj: telefonHam
      ? `${telefonNormalize(telefonHam)} doğrulaması sıfırlandı.`
      : "Oturum doğrulaması sıfırlandı.",
  });

  musteriTelCookieTemizle(response);

  return response;
}
