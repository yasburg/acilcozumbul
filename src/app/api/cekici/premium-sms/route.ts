import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciBildirimKrediTutari,
  PANEL_BILDIRIM_KREDI,
  PREMIUM_SMS_BILDIRIM_KREDI,
} from "@/lib/ihale";
import {
  cekiciSifreOtpDogrula,
  cekiciSifreOtpGonder,
  cekiciSifreOtpTemizle,
} from "@/lib/cekici-sifre-otp";
import { smsDurumu } from "@/lib/sms-provider";
import {
  otpBasariMesaji,
  otpGelmediMesaji,
  otpHataMesaji,
  sendOtp,
} from "@/lib/otp-gonder";
import { telefonMaskele } from "@/lib/telefon";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    premiumSmsAktif: Boolean(cekici.premiumSmsAktif),
    bildirimKredi: cekiciBildirimKrediTutari(cekici),
    panelKredi: PANEL_BILDIRIM_KREDI,
    premiumKredi: PREMIUM_SMS_BILDIRIM_KREDI,
    telefon: telefonMaskele(cekici.telefon),
    smsGercek: smsDurumu().gercekGonderim,
  });
}

/** OTP gönder — premium SMS açmak için telefon doğrulama */
export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const islem = String(body.islem ?? "otp_gonder");

  if (islem !== "otp_gonder") {
    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  }

  const sonuc = await cekiciSifreOtpGonder(cekici.telefon);
  if (!sonuc.ok) {
    return NextResponse.json(
      {
        error: sonuc.hata,
        yenidenGonderSn: sonuc.yenidenGonderSn,
      },
      { status: sonuc.yenidenGonderSn ? 429 : 400 }
    );
  }

  const smsMesaj = `acilcozumbul.com: Premium SMS aktivasyon kodunuz: ${sonuc.kod}. 5 dakika geçerlidir.`;
  const otp = await sendOtp(sonuc.telefon, sonuc.kod, {
    aliciTipi: "cekici",
    talepId: "premium-sms-otp",
    smsMesaj,
  });

  if (!otp.basarili && !sonuc.gelistirmeKodu) {
    return NextResponse.json(
      {
        error: otpHataMesaji(),
        smsHatasi: otp.hata,
        smsGonderildi: false,
        otpKanal: otp.kanal,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    smsGonderildi: otp.basarili,
    otpKanal: otp.kanal,
    yenidenGonderSn: sonuc.yenidenGonderSn,
    gelistirmeKodu: otp.basarili ? undefined : sonuc.gelistirmeKodu,
    mesaj: otp.basarili
      ? otpBasariMesaji(telefonMaskele(cekici.telefon), otp.kanal)
      : otpGelmediMesaji(otp.kanal),
  });
}

export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const premiumSmsAktif = Boolean(body.premiumSmsAktif);

  if (!premiumSmsAktif) {
    cekici.premiumSmsAktif = false;
    await updateCekici(cekici);
    return NextResponse.json({
      premiumSmsAktif: false,
      bildirimKredi: PANEL_BILDIRIM_KREDI,
      mesaj: "Premium SMS kapatıldı. Talepler panelde 1 kredi ile açılır.",
    });
  }

  const otpKod = String(body.otpKod ?? "").replace(/\D/g, "");
  if (otpKod.length !== 6) {
    return NextResponse.json(
      { error: "Premium SMS için SMS doğrulama kodu gerekli." },
      { status: 400 }
    );
  }

  const dogru = await cekiciSifreOtpDogrula(cekici.telefon, otpKod);
  if (!dogru.ok) {
    return NextResponse.json({ error: dogru.hata }, { status: 400 });
  }

  cekici.premiumSmsAktif = true;
  await updateCekici(cekici);
  await cekiciSifreOtpTemizle(cekici.telefon);

  return NextResponse.json({
    premiumSmsAktif: true,
    bildirimKredi: PREMIUM_SMS_BILDIRIM_KREDI,
    mesaj:
      "Premium SMS açıldı. Yeni talepler anlık SMS ile gelir (bildirim başına 2 kredi).",
  });
}
