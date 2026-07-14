import { NextRequest, NextResponse } from "next/server";
import {
  bekleyenCekiciKayitOtp,
  cekiciKayitOtpGonder,
} from "@/lib/cekici-kayit-otp";
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
        mesaj: otpBekleyenMesaji(),
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

  const smsMesaj = `acilcozumbul.com kayit dogrulama kodunuz: ${sonuc.kod}. 5 dakika gecerlidir.`;
  const otp = await sendOtp(sonuc.telefon, sonuc.kod, {
    aliciTipi: "cekici",
    talepId: "kayit-otp",
    smsMesaj,
  });

  const body: Record<string, unknown> = {
    yenidenGonderSn: sonuc.yenidenGonderSn,
    smsGonderildi: otp.basarili,
    otpKanal: otp.kanal,
    telefon: sonuc.telefon,
  };

  if (otp.basarili) {
    body.mesaj = otpBasariMesaji(telefonMaskele(sonuc.telefon));
    return NextResponse.json(body);
  }

  if (sonuc.gelistirmeKodu) {
    body.gelistirmeKodu = sonuc.gelistirmeKodu;
    body.smsGonderildi = false;
    body.mesaj = otpGelmediMesaji();
    return NextResponse.json(body);
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
