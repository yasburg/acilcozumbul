import { NextRequest, NextResponse } from "next/server";
import { getTalepById } from "@/lib/db";
import { isDemoTalepId } from "@/lib/demo-oturum";
import { bekleyenOtpBilgisi, otpGonder } from "@/lib/musteri-otp";
import { funnelOlayKaydet } from "@/lib/funnel";
import { guvenlikOlayiKaydet, otpFraudKontrol } from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";
import { telefonMaskele, telefonNormalize } from "@/lib/telefon";
import {
  otpBasariMesaji,
  otpBekleyenMesaji,
  otpGelmediMesaji,
  otpHataMesaji,
  sendOtp,
} from "@/lib/otp-gonder";
import { musteriTelCookieAyarla } from "@/lib/musteri-auth";

export async function POST(request: NextRequest) {
  const gelen = await request.json().catch(() => ({}));
  const ip = istekIp(request);
  const hash = ipHash(ip);

  const fraud = await otpFraudKontrol(hash);
  if (!fraud.ok) {
    return NextResponse.json({ error: fraud.hata }, { status: 429 });
  }

  let telefonHam =
    typeof gelen.telefon === "string" ? gelen.telefon : "";

  const talepId =
    typeof gelen.talepId === "string" ? gelen.talepId.trim() : "";
  if (talepId && !isDemoTalepId(talepId)) {
    const talep = await getTalepById(talepId);
    if (!talep) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }
    telefonHam = talep.telefon;
  }

  const sonuc = await otpGonder(telefonHam);

  if (!sonuc.ok) {
    if (sonuc.yenidenGonderSn != null) {
      const bekleyen = await bekleyenOtpBilgisi(telefonHam);
      return NextResponse.json({
        kodBekliyor: true,
        mesaj: otpBekleyenMesaji(),
        yenidenGonderSn: sonuc.yenidenGonderSn,
        gelistirmeKodu: bekleyen.gelistirmeKodu,
        telefon: bekleyen.telefon ?? telefonNormalize(telefonHam),
        telefonMaskeli: telefonMaskele(
          bekleyen.telefon ?? telefonNormalize(telefonHam)
        ),
      });
    }
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  if (sonuc.zatenDogrulandi) {
    const response = NextResponse.json({
      zatenDogrulandi: true,
      telefon: sonuc.telefon,
      telefonMaskeli: telefonMaskele(sonuc.telefon),
      mesaj: "Bu numara bugün doğrulanmış. Tekrar SMS gerekmez.",
    });
    musteriTelCookieAyarla(response, sonuc.telefon);
    return response;
  }

  const telNorm = telefonNormalize(sonuc.telefon);
  await guvenlikOlayiKaydet({
    anahtar: hash ? `ip:${hash}` : `tel:${telNorm}`,
    olayTipi: "otp_gonder",
    ipHash: hash,
    telefon: telNorm,
  });
  await funnelOlayKaydet({
    olay: "otp_gonder",
    telefon: telNorm,
    ipHash: hash,
  });

  const smsMesaj = `acilcozumbul.com dogrulama kodunuz: ${sonuc.kod}. 5 dakika gecerlidir.`;
  const otp = await sendOtp(sonuc.telefon, sonuc.kod, {
    aliciTipi: "musteri",
    talepId: talepId || "otp",
    smsMesaj,
  });

  const yanit: Record<string, unknown> = {
    yenidenGonderSn: sonuc.yenidenGonderSn,
    smsGonderildi: otp.basarili,
    otpKanal: otp.kanal,
    telefon: sonuc.telefon,
    telefonMaskeli: telefonMaskele(sonuc.telefon),
  };

  if (otp.basarili) {
    yanit.mesaj = otpBasariMesaji(telefonMaskele(sonuc.telefon));
    return NextResponse.json(yanit);
  }

  if (sonuc.gelistirmeKodu) {
    yanit.gelistirmeKodu = sonuc.gelistirmeKodu;
    yanit.smsGonderildi = false;
    yanit.mesaj = otpGelmediMesaji();
    return NextResponse.json(yanit);
  }

  return NextResponse.json(
    {
      error: otpHataMesaji(),
      smsGonderildi: false,
      otpKanal: otp.kanal,
      smsHatasi: otp.hata ?? "OTP SMS servisi yanıt vermedi",
    },
    { status: 503 }
  );
}
