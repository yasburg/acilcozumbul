import { NextRequest, NextResponse } from "next/server";
import {
  bekleyenCekiciSifreOtp,
  cekiciSifreOtpGonder,
} from "@/lib/cekici-sifre-otp";
import { getCekiciByTelefon } from "@/lib/db";
import { telefonMaskele, telefonNormalize } from "@/lib/telefon";
import { sendSms } from "@/lib/sms-provider";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const { telefon } = await request.json();
  const tel = telefonNormalize(String(telefon ?? "").trim());

  const cekici = await getCekiciByTelefon(tel);
  if (!cekici?.aktif) {
    return NextResponse.json(
      { error: "Bu telefon numarasına kayıtlı aktif üye bulunamadı." },
      { status: 404 }
    );
  }

  const sonuc = await cekiciSifreOtpGonder(telefon ?? "");

  if (!sonuc.ok) {
    if (sonuc.yenidenGonderSn != null) {
      const bekleyen = await bekleyenCekiciSifreOtp(telefon ?? "");
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

  const smsMesaj = `acilcozumbul.com şifre sıfırlama kodunuz: ${sonuc.kod}. 5 dakika geçerlidir.`;
  const sms = await sendSms(sonuc.telefon, smsMesaj, {
    aliciTipi: "cekici",
    talepId: "sifre-sifirla",
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
      "Kod oluşturuldu ancak SMS gönderilemedi. Bir dakika sonra tekrar deneyin.";
    body.smsHatasi = sms.hata ?? "SMS servisi yanıt vermedi";
  }

  return NextResponse.json(body);
}
