import { NextResponse } from "next/server";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import { netgsmSmsMesajGecerliMi } from "@/lib/sms-karakter";
import { sendPanelTopluSms, smsDurumu } from "@/lib/sms-provider";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  kaydetTopluSmsGecmis,
  topluSmsOncekiTelefonlariBul,
} from "@/lib/toplu-sms-gecmis-db";
import {
  MIGRATION_027_MESAJ,
  topluSmsGecmisTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";
import {
  SMS50_KAMPANYA_KODU,
  sms50VaryantMi,
} from "@/lib/sms50-kampanya";
import {
  TOPLU_SMS_ADMIN_TEST_AD,
  TOPLU_SMS_ADMIN_TEST_TELEFON,
  topluSmsAdminTestIleBaslat,
} from "@/lib/toplu-sms-admin-test";

const MAX_ALICI = 500;

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

export async function POST(request: Request) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let body: {
    mesaj?: string;
    telefonlar?: string[];
    adlar?: Record<string, string>;
    oncekileriAtla?: boolean;
    kampanyaKodu?: string;
    varyant?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const mesaj = typeof body.mesaj === "string" ? body.mesaj.trim() : "";
  const mesajKontrol = netgsmSmsMesajGecerliMi(mesaj);
  if (!mesajKontrol.gecerli) {
    return NextResponse.json(
      { error: mesajKontrol.hata ?? "Mesaj geçersiz." },
      { status: 400 }
    );
  }

  const varyantHam = String(body.varyant ?? "").toLowerCase().trim();
  const varyant = varyantHam && sms50VaryantMi(varyantHam) ? varyantHam : null;
  const kampanyaKodu = varyant
    ? String(body.kampanyaKodu ?? SMS50_KAMPANYA_KODU).trim() ||
      SMS50_KAMPANYA_KODU
    : null;

  const hamListe = Array.isArray(body.telefonlar) ? body.telefonlar : [];
  const gecerli: string[] = [];
  const gecersiz: string[] = [];
  for (const ham of hamListe) {
    const t = telefonNormalize(String(ham ?? ""));
    if (telefonGecerliMi(t)) gecerli.push(t);
    else if (String(ham ?? "").trim()) gecersiz.push(String(ham));
  }
  let benzersiz = [...new Set(gecerli)];

  if (benzersiz.length === 0) {
    return NextResponse.json(
      { error: "Gönderilecek geçerli telefon yok." },
      { status: 400 }
    );
  }
  if (benzersiz.length > MAX_ALICI) {
    return NextResponse.json(
      { error: `En fazla ${MAX_ALICI} alıcı gönderilebilir.` },
      { status: 400 }
    );
  }

  let oncekiAtlandi = 0;
  const gecmisVar = await topluSmsGecmisTablolariVar();
  if (body.oncekileriAtla && gecmisVar) {
    const oncekiler = await topluSmsOncekiTelefonlariBul(benzersiz);
    const oncekiSayisi = benzersiz.filter((t) => oncekiler.has(t)).length;
    benzersiz = benzersiz.filter((t) => !oncekiler.has(t));
    oncekiAtlandi = oncekiSayisi;
    if (benzersiz.length === 0) {
      return NextResponse.json(
        {
          error:
            "Tüm numaralar daha önce gönderilmiş; gönderilecek yeni numara kalmadı.",
          oncekiAtlandi,
        },
        { status: 400 }
      );
    }
  }

  benzersiz = topluSmsAdminTestIleBaslat(benzersiz);

  const durum = smsDurumu();
  if (!durum.gercekGonderim) {
    return NextResponse.json(
      {
        error:
          "Netgsm yapılandırılmamış. NETGSM_USERCODE / PASSWORD / MSGHEADER gerekli.",
      },
      { status: 503 }
    );
  }

  const sonuc = await sendPanelTopluSms(benzersiz, mesaj);

  let listeId: string | null = null;
  if (gecmisVar) {
    try {
      const adlar = { ...(body.adlar ?? {}) };
      if (!adlar[TOPLU_SMS_ADMIN_TEST_TELEFON]) {
        adlar[TOPLU_SMS_ADMIN_TEST_TELEFON] = TOPLU_SMS_ADMIN_TEST_AD;
      }
      const kayit = await kaydetTopluSmsGecmis({
        gonderenEposta: user.email,
        mesaj,
        mesajParca: mesajKontrol.parca,
        mesajBirim: mesajKontrol.birim,
        kampanyaKodu,
        varyant,
        alicilar: sonuc.sonuclar.map((s) => ({
          telefon: s.telefon,
          ad: adlar[s.telefon] ?? null,
          basarili: s.basarili,
          hata: s.hata ?? null,
        })),
      });
      listeId = kayit.listeId;
    } catch (e) {
      console.error("[toplu-sms] geçmiş kaydı başarısız", e);
    }
  }

  return NextResponse.json({
    ...sonuc,
    mesajBirim: mesajKontrol.birim,
    mesajParca: mesajKontrol.parca,
    gecersizAtlandi: gecersiz.length,
    oncekiAtlandi,
    listeId,
    kampanyaKodu,
    varyant,
    gecmisUyari: gecmisVar ? undefined : MIGRATION_027_MESAJ,
  });
}
