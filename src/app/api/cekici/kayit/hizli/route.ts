import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addCekici, getCekiciByTelefon } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";
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
import {
  cekiciAuthKullaniciOlustur,
  cekiciAuthKullaniciSil,
  cekiciAuthRastgeleSifre,
} from "@/lib/cekici-auth";
import {
  cekiciKayitOtpDogrula,
  cekiciKayitOtpTemizle,
} from "@/lib/cekici-kayit-otp";
import { baglaSms50TokenKayit } from "@/lib/sms50-token";
import { kayitFunnelMi } from "@/lib/kayit-funnel";
import { kaydetKayitFunnelOlay } from "@/lib/kayit-funnel-olay";
import { sms50TokenGecerliMi } from "@/lib/sms50-kampanya";

/**
 * Passwordless hızlı kayıt: OTP doğrula → hesap oluştur → cookie.
 * Ad / bölge / hizmet kurulumda tamamlanır.
 */
export async function POST(request: NextRequest) {
  await ensureSeedData();

  const body = await request.json();
  const { telefon, otpKod } = body;
  const funnelHam = String(body.funnel ?? body.kayitFunnel ?? "").toLowerCase();
  const funnel = kayitFunnelMi(funnelHam) ? funnelHam : "b";
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : null;

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

  if (!telefon?.trim()) {
    return NextResponse.json({ error: "Telefon gerekli." }, { status: 400 });
  }
  if (!telefonGecerliMi(telefon)) {
    return NextResponse.json(
      { error: telefonDogrulamaHatasi(telefon) },
      { status: 400 }
    );
  }

  const tel = telefonNormalize(telefon);
  const mevcut = await getCekiciByTelefon(tel);
  if (mevcut) {
    return NextResponse.json(
      { error: "Bu telefon numarası zaten kayıtlı. Giriş yapın." },
      { status: 409 }
    );
  }

  const otpDogrulama = await cekiciKayitOtpDogrula(tel, String(otpKod ?? ""));
  if (!otpDogrulama.ok) {
    return NextResponse.json({ error: otpDogrulama.hata }, { status: 400 });
  }

  await kaydetKayitFunnelOlay({
    funnel,
    olay: "otp_ok",
    sessionId,
  });

  const kodNormalized = kodHam?.trim()
    ? kampanyaKoduNormalize(kodHam)
    : undefined;

  const kayitHazir = await kayitKoduHazirla(kodNormalized, tel);
  if (!kayitHazir.ok) {
    return NextResponse.json({ error: kayitHazir.hata }, { status: 400 });
  }

  const token = randomUUID();
  const baslangicKredi = kayitBaslangicKredisi(kayitHazir.sonuc);
  const cekiciId = randomUUID();
  const rastgeleSifre = cekiciAuthRastgeleSifre();

  let authUserId: string;
  try {
    authUserId = await cekiciAuthKullaniciOlustur({
      telefon: tel,
      sifre: rastgeleSifre,
      cekiciId,
      ad: undefined,
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Auth kaydı oluşturulamadı.";
    return NextResponse.json({ error: mesaj }, { status: 400 });
  }

  const cekici: Cekici = {
    id: cekiciId,
    ad: "",
    telefon: tel,
    token,
    sifre: "",
    authUserId,
    kredi: baslangicKredi,
    sehir: "İstanbul",
    hizmetIlceleri: [],
    hizmetBolgeleri: {},
    hizmetModu: "il_ilce",
    menzilKm: 30,
    hizmetSorunTipleri: [],
    aktif: true,
    kayitTarihi: new Date().toISOString(),
    premiumSmsAktif: true,
    kayitFunnel: funnel,
    kurulumTamam: false,
    davetEdenId:
      kayitHazir.sonuc.uygulandi && kayitHazir.sonuc.tip === "davet"
        ? kayitHazir.sonuc.davet.davetEden.id
        : undefined,
  };

  try {
    await addCekici(cekici);
  } catch (e) {
    await cekiciAuthKullaniciSil(authUserId);
    throw e;
  }
  await cekiciKayitOtpTemizle(tel);

  if (kayitHazir.sonuc.uygulandi) {
    try {
      await kayitKoduBonusTamamla(cekici.id, kayitHazir.sonuc);
    } catch (e) {
      console.error("[kayit/hizli] kod bonusu:", e);
    }
  }

  if (smsToken) {
    try {
      await baglaSms50TokenKayit({ token: smsToken, cekiciId: cekici.id });
    } catch (e) {
      console.error("[kayit/hizli] sms_token:", e);
    }
  }

  await kaydetKayitFunnelOlay({
    funnel,
    olay: "hesap",
    sessionId,
    cekiciId: cekici.id,
  });

  const response = NextResponse.json({
    id: cekici.id,
    mesaj: "Kaydınız oluşturuldu.",
    kurulumGerekli: true,
    hediyeKredi: baslangicKredi,
    kodUygulandi: kayitHazir.sonuc.uygulandi,
  });

  response.cookies.set(CEKICI_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
