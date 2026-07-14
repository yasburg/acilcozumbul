import { NextRequest, NextResponse } from "next/server";
import { bekleyenOtpBilgisi, otpGonder } from "@/lib/musteri-otp";
import { funnelOlayKaydet } from "@/lib/funnel";
import { guvenlikOlayiKaydet, otpFraudKontrol } from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";
import { telefonNormalize } from "@/lib/telefon";
import {
  otpBasariMesaji,
  otpBekleyenMesaji,
  otpGelmediMesaji,
  otpHataMesaji,
  sendOtp,
} from "@/lib/otp-gonder";
import { telefonMaskele } from "@/lib/telefon";

export async function POST(request: NextRequest) {
  const { telefon } = await request.json();
  const ip = istekIp(request);
  const hash = ipHash(ip);

  const fraud = await otpFraudKontrol(hash);
  if (!fraud.ok) {
    return NextResponse.json({ error: fraud.hata }, { status: 429 });
  }

  const sonuc = await otpGonder(telefon ?? "");

  if (!sonuc.ok) {
    if (sonuc.yenidenGonderSn != null) {
      const bekleyen = await bekleyenOtpBilgisi(telefon ?? "");
      return NextResponse.json({
        kodBekliyor: true,
        mesaj: otpBekleyenMesaji(),
        yenidenGonderSn: sonuc.yenidenGonderSn,
        gelistirmeKodu: bekleyen.gelistirmeKodu,
        telefon: bekleyen.telefon ?? telefonNormalize(telefon ?? ""),
      });
    }
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
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

  const smsMesaj = `acilcozumbul.com doğrulama kodunuz: ${sonuc.kod}. 5 dakika geçerlidir.`;
  const otp = await sendOtp(sonuc.telefon, sonuc.kod, {
    aliciTipi: "musteri",
    talepId: "otp",
    smsMesaj,
  });

  const body: Record<string, unknown> = {
    yenidenGonderSn: sonuc.yenidenGonderSn,
    smsGonderildi: otp.basarili,
    otpKanal: otp.kanal,
    telefon: sonuc.telefon,
  };

  if (otp.basarili) {
    body.mesaj = otpBasariMesaji(telefonMaskele(sonuc.telefon), otp.kanal);
    return NextResponse.json(body);
  }

  if (sonuc.gelistirmeKodu) {
    body.gelistirmeKodu = sonuc.gelistirmeKodu;
    body.smsGonderildi = false;
    body.mesaj = otpGelmediMesaji(otp.kanal);
    return NextResponse.json(body);
  }

  return NextResponse.json(
    {
      error: otpHataMesaji(),
      smsGonderildi: false,
      otpKanal: otp.kanal,
      smsHatasi: otp.hata ?? "OTP servisi yanıt vermedi",
    },
    { status: 503 }
  );
}
