import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addCekici, getCekiciByTelefon } from "@/lib/db";
import { CEKICI_COOKIE, cekiciOturumCookieAyarlari } from "@/lib/auth";
import { ensureSeedData } from "@/lib/seed";
import {
  kayitBaslangicKredisi,
  kayitKoduBonusTamamla,
  kayitKoduHazirla,
} from "@/lib/kayit-kodu";
import { kampanyaKoduNormalize } from "@/lib/kampanya-kodu";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "@/lib/telefon";
import type { Cekici } from "@/lib/types";
import { tumSorunTipIdleri } from "@/lib/sorun-tipleri";
import { ilGecerliMi } from "@/lib/il-ilce";
import { kayitVarsayilanHizmetBolgeleri } from "@/lib/cekici-hizmet-bolge";
import {
  cekiciKayitOtpDogrula,
  cekiciKayitOtpTemizle,
} from "@/lib/cekici-kayit-otp";
import {
  cekiciAuthKullaniciOlustur,
  cekiciAuthKullaniciSil,
} from "@/lib/cekici-auth";
import { dogumTarihiDogrula } from "@/lib/dogum-tarihi";
import { baglaSms50TokenKayit } from "@/lib/sms50-token";
import { sms50TokenGecerliMi } from "@/lib/sms50-kampanya";

export async function POST(request: NextRequest) {
  await ensureSeedData();

  const body = await request.json();
  const { ad, telefon, sehir, sifre, otpKod, dogumTarihi } = body;
  const kodHam =
    typeof body.kayitKodu === "string"
      ? body.kayitKodu
      : typeof body.davetKodu === "string"
        ? body.davetKodu
        : undefined;
  const smsTokenHam =
    typeof body.smsToken === "string"
      ? body.smsToken.trim()
      : typeof body.sms_token === "string"
        ? body.sms_token.trim()
        : "";
  const smsToken = sms50TokenGecerliMi(smsTokenHam) ? smsTokenHam : null;

  if (!ad?.trim() || !telefon?.trim() || !sehir?.trim() || !sifre?.trim()) {
    return NextResponse.json(
      { error: "Tüm alanları doldurun." },
      { status: 400 }
    );
  }

  const dogum = dogumTarihiDogrula(dogumTarihi);
  if (!dogum.ok) {
    return NextResponse.json({ error: dogum.hata }, { status: 400 });
  }

  if (!telefonGecerliMi(telefon)) {
    return NextResponse.json(
      { error: telefonDogrulamaHatasi(telefon) },
      { status: 400 }
    );
  }

  const tel = telefonNormalize(telefon);

  if (sifre.length < 6) {
    return NextResponse.json(
      { error: "Şifre en az 6 karakter olmalı." },
      { status: 400 }
    );
  }

  if (!ilGecerliMi(sehir)) {
    return NextResponse.json({ error: "Geçerli bir il seçin." }, { status: 400 });
  }

  const mevcut = await getCekiciByTelefon(tel);
  if (mevcut) {
    return NextResponse.json(
      { error: "Bu telefon numarası zaten kayıtlı." },
      { status: 409 }
    );
  }

  const otpDogrulama = await cekiciKayitOtpDogrula(tel, String(otpKod ?? ""));
  if (!otpDogrulama.ok) {
    return NextResponse.json({ error: otpDogrulama.hata }, { status: 400 });
  }

  const kodNormalized = kodHam?.trim()
    ? kampanyaKoduNormalize(kodHam)
    : undefined;

  const kayitHazir = await kayitKoduHazirla(kodNormalized, tel);
  if (!kayitHazir.ok) {
    return NextResponse.json({ error: kayitHazir.hata }, { status: 400 });
  }

  const token = randomUUID();
  const baslangicKredi = kayitBaslangicKredisi(kayitHazir.sonuc);
  const hizmetBolgeleri = kayitVarsayilanHizmetBolgeleri(sehir);
  const cekiciId = randomUUID();
  const sifreTemiz = String(sifre).trim();

  let authUserId: string;
  try {
    authUserId = await cekiciAuthKullaniciOlustur({
      telefon: tel,
      sifre: sifreTemiz,
      cekiciId,
      ad: ad.trim(),
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Auth kaydı oluşturulamadı.";
    return NextResponse.json({ error: mesaj }, { status: 400 });
  }

  const cekici: Cekici = {
    id: cekiciId,
    ad: ad.trim(),
    telefon: tel,
    token,
    sifre: "",
    authUserId,
    kredi: baslangicKredi,
    sehir,
    hizmetIlceleri: hizmetBolgeleri[sehir] ?? [],
    hizmetBolgeleri,
    hizmetModu: "il_ilce",
    menzilKm: 30,
    hizmetSorunTipleri: tumSorunTipIdleri(),
    aktif: true,
    kayitTarihi: new Date().toISOString(),
    dogumTarihi: dogum.deger,
    premiumSmsAktif: true,
    davetEdenId:
      kayitHazir.sonuc.uygulandi && kayitHazir.sonuc.tip === "davet"
        ? kayitHazir.sonuc.davet.davetEden.id
        : undefined,
  };

  try {
    await addCekici(cekici);
  } catch (e) {
    // DB kaydı başarısızsa Auth kullanıcısını geri al
    await cekiciAuthKullaniciSil(authUserId);
    throw e;
  }
  await cekiciKayitOtpTemizle(tel);

  if (kayitHazir.sonuc.uygulandi) {
    try {
      await kayitKoduBonusTamamla(cekici.id, kayitHazir.sonuc);
    } catch (e) {
      console.error("[kayit] kod bonusu tamamlanamadı:", e);
    }
  }

  if (smsToken) {
    try {
      await baglaSms50TokenKayit({ token: smsToken, cekiciId: cekici.id });
    } catch (e) {
      console.error("[kayit] sms_token bağlama:", e);
    }
  }

  const mesaj = kayitHazir.sonuc.uygulandi
    ? `Kayıt başarılı. ${baslangicKredi} hediye kredi hesabınıza tanımlandı!`
    : "Kayıt başarılı. Hoş geldiniz!";

  const response = NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    mesaj,
    kodUygulandi: kayitHazir.sonuc.uygulandi,
    kodTipi: kayitHazir.sonuc.uygulandi ? kayitHazir.sonuc.tip : undefined,
    davetUygulandi:
      kayitHazir.sonuc.uygulandi && kayitHazir.sonuc.tip === "davet",
    hediyeKredi: baslangicKredi,
  });

  response.cookies.set(CEKICI_COOKIE, token, cekiciOturumCookieAyarlari(true));

  return response;
}
