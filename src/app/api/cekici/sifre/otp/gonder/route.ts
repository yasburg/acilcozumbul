import { NextRequest, NextResponse } from "next/server";
import {
  bekleyenCekiciSifreOtp,
  cekiciSifreOtpGonder,
} from "@/lib/cekici-sifre-otp";
import { getCekiciByTelefon } from "@/lib/db";
import { telefonMaskele, telefonNormalize } from "@/lib/telefon";
import {
  otpBasariMesaji,
  otpBekleyenMesaji,
  otpGelmediMesaji,
  otpHataMesaji,
  sendOtp,
} from "@/lib/otp-gonder";
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
        mesaj: otpBekleyenMesaji(),
        yenidenGonderSn: sonuc.yenidenGonderSn,
        gelistirmeKodu: bekleyen.gelistirmeKodu,
        telefon: bekleyen.telefon ?? tel,
      });
    }
    return NextResponse.json({ error: sonuc.hata }, { status: 400 });
  }

  const smsMesaj = `acilcozumbul.com şifre sıfırlama kodunuz: ${sonuc.kod}. 5 dakika geçerlidir.`;
  const otp = await sendOtp(sonuc.telefon, sonuc.kod, {
    aliciTipi: "cekici",
    talepId: "sifre-sifirla",
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
