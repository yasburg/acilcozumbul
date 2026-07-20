import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  cekiciBildirimKrediTutari,
  cekiciPremiumSmsAktifMi,
  PANEL_BILDIRIM_KREDI,
  PREMIUM_SMS_BILDIRIM_KREDI,
} from "@/lib/ihale";
import { cekiciGirisSifreKontrol } from "@/lib/cekici-auth";
import { smsDurumu } from "@/lib/sms-provider";
import { telefonMaskele } from "@/lib/telefon";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    premiumSmsAktif: cekiciPremiumSmsAktifMi(cekici),
    bildirimKredi: cekiciBildirimKrediTutari(cekici),
    panelKredi: PANEL_BILDIRIM_KREDI,
    premiumKredi: PREMIUM_SMS_BILDIRIM_KREDI,
    telefon: telefonMaskele(cekici.telefon),
    smsGercek: smsDurumu().gercekGonderim,
  });
}

/** Premium SMS aç/kapa — hesap şifresi gerekir (SMS yok) */
export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const premiumSmsAktif = Boolean(body.premiumSmsAktif);
  const sifre = String(body.sifre ?? "");

  if (!sifre.trim()) {
    return NextResponse.json(
      { error: "Değişiklik için hesap şifrenizi girin." },
      { status: 400 }
    );
  }

  const sifreOk = await cekiciGirisSifreKontrol(cekici, sifre);
  if (!sifreOk) {
    return NextResponse.json(
      { error: "Şifre hatalı." },
      { status: 401 }
    );
  }

  cekici.premiumSmsAktif = premiumSmsAktif;
  await updateCekici(cekici);

  if (!premiumSmsAktif) {
    return NextResponse.json({
      premiumSmsAktif: false,
      bildirimKredi: PANEL_BILDIRIM_KREDI,
      mesaj: "Premium SMS kapatıldı. Talepler toplu SMS ile 1 kredi.",
    });
  }

  return NextResponse.json({
    premiumSmsAktif: true,
    bildirimKredi: PREMIUM_SMS_BILDIRIM_KREDI,
    mesaj:
      "Premium SMS açıldı. Yeni talepler anlık OTP SMS ile gelir (bildirim başına 2 kredi).",
  });
}
