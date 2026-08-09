import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addCekici, getCekiciByTelefon, updateCekici } from "@/lib/db";
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
import type { Cekici, HizmetBolgeleri } from "@/lib/types";
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
import { ilGecerliMi, ilceListesi } from "@/lib/il-ilce";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";
import { ISTANBUL_IL } from "@/lib/istanbul-ilceler";
import { kayitCarkOdulTalepEt } from "@/lib/kayit-cark-db";

/**
 * Passwordless hızlı kayıt: OTP doğrula → hesap oluştur → cookie.
 * Ad / ayrıntılı ayarlar kurulumda tamamlanır; şehir/bölge/hizmet önceden gelebilir.
 */
export async function POST(request: NextRequest) {
  await ensureSeedData();

  const body = await request.json();
  const { telefon, otpKod } = body;
  const funnelHam = String(body.funnel ?? body.kayitFunnel ?? "").toLowerCase();
  const funnel = kayitFunnelMi(funnelHam) ? funnelHam : "b";
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : null;

  const sehirHam =
    typeof body.sehir === "string" ? body.sehir.trim() : ISTANBUL_IL;
  const sehir = ilGecerliMi(sehirHam) ? sehirHam : ISTANBUL_IL;
  const gecerliIlceler = new Set(ilceListesi(sehir));
  const hizmetIlceleri = Array.isArray(body.hizmetIlceleri)
    ? (body.hizmetIlceleri as unknown[])
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter((x) => gecerliIlceler.has(x))
    : [];
  const hizmetBolgeleri: HizmetBolgeleri =
    hizmetIlceleri.length > 0 ? { [sehir]: hizmetIlceleri } : {};
  const hizmetSorunTipleri = Array.isArray(body.hizmetSorunTipleri)
    ? (body.hizmetSorunTipleri as unknown[])
        .filter((x): x is string => typeof x === "string")
        .filter(gecerliSorunTipi)
    : [];

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
  const carkToken =
    typeof body.carkToken === "string" ? body.carkToken.trim() : "";

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
    sehir,
    hizmetIlceleri,
    hizmetBolgeleri,
    hizmetModu: "il_ilce",
    menzilKm: 30,
    hizmetSorunTipleri,
    aktif: true,
    kayitTarihi: new Date().toISOString(),
    premiumSmsAktif: true,
    bildirimSeviye: 3,
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

  let carkSms = 0;
  if (carkToken) {
    try {
      const claim = await kayitCarkOdulTalepEt({
        token: carkToken,
        telefon: tel,
        cekiciId: cekici.id,
      });
      if (claim.ok) {
        carkSms = claim.rewardSms;
        cekici.kredi = baslangicKredi + carkSms;
        await updateCekici(cekici);
        await kaydetKayitFunnelOlay({
          funnel,
          olay: "wheel_reward_claimed",
          sessionId,
          cekiciId: cekici.id,
          meta: { reward_sms: carkSms },
        });
      } else {
        await kaydetKayitFunnelOlay({
          funnel,
          olay: "wheel_reward_claim_failed",
          sessionId,
          cekiciId: cekici.id,
          meta: { hata: claim.hata },
        });
      }
    } catch (e) {
      console.error("[kayit/hizli] cark:", e);
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
    hediyeKredi: baslangicKredi + carkSms,
    carkSms: carkSms || undefined,
    kodUygulandi: kayitHazir.sonuc.uygulandi,
  });

  response.cookies.set(CEKICI_COOKIE, token, cekiciOturumCookieAyarlari(true));

  return response;
}
