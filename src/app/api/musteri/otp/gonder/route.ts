import { NextRequest, NextResponse } from "next/server";
import { bekleyenOtpBilgisi, otpGonder } from "@/lib/musteri-otp";
import { funnelOlayKaydet } from "@/lib/funnel";
import { guvenlikOlayiKaydet, otpFraudKontrol } from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";
import { telefonNormalize } from "@/lib/telefon";
import { sendSms } from "@/lib/sms-provider";
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
        mesaj: "Kod zaten gönderildi. SMS'teki 6 haneli kodu girin.",
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
  const sms = await sendSms(sonuc.telefon, smsMesaj, {
    aliciTipi: "musteri",
    talepId: "otp",
  });

  const body: Record<string, unknown> = {
    yenidenGonderSn: sonuc.yenidenGonderSn,
    smsGonderildi: sms.basarili,
    telefon: sonuc.telefon,
  };

  if (sms.basarili) {
    body.mesaj = `${telefonMaskele(sonuc.telefon)} numarasına doğrulama kodu gönderildi.`;
  } else if (sonuc.gelistirmeKodu) {
    body.gelistirmeKodu = sonuc.gelistirmeKodu;
    body.smsGonderildi = false;
    body.mesaj =
      "SMS şu an gitmedi (test ortamı). Ekrandaki geliştirme kodunu girin.";
  } else {
    body.mesaj =
      "Kod oluşturuldu ancak SMS gönderilemedi. Bir dakika sonra «Kodu tekrar gönder» deneyin.";
    body.smsHatasi = sms.hata ?? "SMS servisi yanıt vermedi";
  }

  return NextResponse.json(body);
}
