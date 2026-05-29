import { NextRequest, NextResponse } from "next/server";
import { otpGonder } from "@/lib/musteri-otp";
import { sendSms, smsDurumu } from "@/lib/sms-provider";
import { telefonMaskele } from "@/lib/telefon";

export async function POST(request: NextRequest) {
  const { telefon } = await request.json();
  const sonuc = await otpGonder(telefon ?? "");

  if (!sonuc.ok) {
    return NextResponse.json(
      { error: sonuc.hata, yenidenGonderSn: sonuc.yenidenGonderSn },
      { status: 400 }
    );
  }

  const smsMesaj = `acilcozumbul.com doğrulama kodunuz: ${sonuc.kod}. 5 dakika geçerlidir.`;
  const sms = await sendSms(sonuc.telefon, smsMesaj, {
    aliciTipi: "musteri",
    talepId: "otp",
  });

  const durum = smsDurumu();
  const body: Record<string, unknown> = {
    mesaj: `${telefonMaskele(sonuc.telefon)} numarasına doğrulama kodu gönderildi.`,
    yenidenGonderSn: sonuc.yenidenGonderSn,
    smsGonderildi: sms.basarili,
  };

  if (!sms.basarili && !durum.gercekGonderim && sonuc.gelistirmeKodu) {
    body.gelistirmeKodu = sonuc.gelistirmeKodu;
    body.mesaj =
      "SMS yapılandırılmamış (geliştirme). Aşağıdaki kodu girin.";
  } else if (!sms.basarili) {
    body.mesaj =
      "SMS gönderilemedi. Lütfen biraz sonra tekrar deneyin veya numaranızı kontrol edin.";
    return NextResponse.json({ error: body.mesaj }, { status: 503 });
  }

  return NextResponse.json(body);
}
