import { NextRequest, NextResponse } from "next/server";
import { getTalepById } from "@/lib/db";
import { isDemoTalepId } from "@/lib/demo-oturum";
import { otpDogrula } from "@/lib/musteri-otp";
import { funnelOlayKaydet } from "@/lib/funnel";
import { ipHash, istekIp } from "@/lib/request-ip";
import { musteriTelCookieAyarla } from "@/lib/musteri-auth";
import { telefonGecerliMi } from "@/lib/telefon";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  let telefon =
    typeof body.telefon === "string" ? body.telefon : "";
  const kod = typeof body.kod === "string" ? body.kod : "";
  const talepId =
    typeof body.talepId === "string" ? body.talepId.trim() : "";

  if (talepId && !isDemoTalepId(talepId)) {
    const talep = await getTalepById(talepId);
    if (!talep) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }
    if (!telefonGecerliMi(talep.telefon)) {
      return NextResponse.json(
        {
          error: "Önce iletişim bilgilerinizi girin.",
          iletisimGerekli: true,
        },
        { status: 400 }
      );
    }
    telefon = talep.telefon;
  }

  const sonuc = await otpDogrula(telefon, kod);

  if (!sonuc.ok) {
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  await funnelOlayKaydet({
    olay: "otp_dogrulandi",
    telefon: sonuc.telefon,
    ipHash: ipHash(istekIp(request)),
  });

  const response = NextResponse.json({
    mesaj: "Telefon doğrulandı.",
    telefon: sonuc.telefon,
  });

  musteriTelCookieAyarla(response, sonuc.telefon);

  return response;
}
