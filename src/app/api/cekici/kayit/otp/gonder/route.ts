import { NextRequest, NextResponse } from "next/server";
import {
  bekleyenCekiciKayitOtp,
  cekiciKayitOtpGonder,
} from "@/lib/cekici-kayit-otp";
import { getCekiciByTelefon } from "@/lib/db";
import { telefonMaskele, telefonNormalize } from "@/lib/telefon";
import { sendSms } from "@/lib/sms-provider";
import { ensureSeedData } from "@/lib/seed";
import { guvenlikOlayiKaydet, otpFraudKontrol } from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const { telefon } = await request.json();
  const ip = istekIp(request);
  const hash = ipHash(ip);

  const fraud = await otpFraudKontrol(hash);
  if (!fraud.ok) {
    return NextResponse.json({ error: fraud.hata }, { status: 429 });
  }

  const tel = telefonNormalize(String(telefon ?? "").trim());
  const mevcut = await getCekiciByTelefon(tel);
  if (mevcut) {
    return NextResponse.json(
      { error: "Bu telefon numarası zaten kayıtlı." },
      { status: 409 }
    );
  }

  const sonuc = await cekiciKayitOtpGonder(telefon ?? "");

  if (!sonuc.ok) {
    if (sonuc.yenidenGonderSn != null) {
      const bekleyen = await bekleyenCekiciKayitOtp(telefon ?? "");
      return NextResponse.json({
        kodBekliyor: true,
        mesaj: "Kod zaten gönderildi. SMS'teki 6 haneli kodu girin.",
        yenidenGonderSn: sonuc.yenidenGonderSn,
        gelistirmeKodu: bekleyen.gelistirmeKodu,
        telefon: bekleyen.telefon ?? tel,
      });
    }
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  await guvenlikOlayiKaydet({
    anahtar: hash ? `ip:${hash}` : `tel:${tel}`,
    olayTipi: "otp_gonder",
    ipHash: hash,
    telefon: tel,
  });

  const smsMesaj = `acilcozumbul.com kayıt doğrulama kodunuz: ${sonuc.kod}. 5 dakika geçerlidir.`;
  const sms = await sendSms(sonuc.telefon, smsMesaj, {
    aliciTipi: "cekici",
    talepId: "kayit-otp",
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
