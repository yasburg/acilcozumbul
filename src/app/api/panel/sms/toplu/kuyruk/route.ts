import { after, NextResponse } from "next/server";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import { netgsmSmsMesajGecerliMi } from "@/lib/sms-karakter";
import { smsDurumu } from "@/lib/sms-provider";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { topluSmsOncekiTelefonlariBul } from "@/lib/toplu-sms-gecmis-db";
import {
  MIGRATION_027_MESAJ,
  MIGRATION_033_MESAJ,
  topluSmsGecmisTablolariVar,
  topluSmsIsTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";
import {
  SMS50_KAMPANYA_KODU,
  sms50VaryantMi,
} from "@/lib/sms50-kampanya";
import { topluSmsTempoNormalize } from "@/lib/toplu-sms-tempo";
import {
  getAktifTopluSmsIsler,
  getTopluSmsIs,
  olusturTopluSmsIsi,
  tetikleTopluSmsKuyruk,
} from "@/lib/toplu-sms-is-db";

const MAX_ALICI = 500;

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

/** Aktif işler veya tek iş durumu */
export async function GET(request: Request) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await topluSmsIsTablolariVar())) {
    return NextResponse.json(
      { error: MIGRATION_033_MESAJ, migrationGerekli: true },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const is = await getTopluSmsIs(id);
    if (!is) {
      return NextResponse.json({ error: "İş bulunamadı." }, { status: 404 });
    }
    /* Durum sorgusu sırasında vadesi gelen partiyi de ilerlet */
    if (is.durum === "beklemede" || is.durum === "suruyor") {
      after(() => {
        void tetikleTopluSmsKuyruk();
      });
    }
    return NextResponse.json({ is });
  }

  const aktif = await getAktifTopluSmsIsler(20);
  if (aktif.length > 0) {
    after(() => {
      void tetikleTopluSmsKuyruk();
    });
  }
  return NextResponse.json({ aktif });
}

/** Arka plan kuyruğuna ekle — sekme açık kalmasına gerek yok */
export async function POST(request: Request) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await topluSmsIsTablolariVar())) {
    return NextResponse.json(
      { error: MIGRATION_033_MESAJ, migrationGerekli: true },
      { status: 503 }
    );
  }

  let body: {
    mesaj?: string;
    telefonlar?: string[];
    adlar?: Record<string, string>;
    oncekileriAtla?: boolean;
    kampanyaKodu?: string;
    varyant?: string;
    kisiBazliTakip?: boolean;
    baslangicAt?: string | null;
    tempo?: {
      partiBoyutu?: number;
      beklemeSn?: number;
      jitterOran?: number;
    };
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
  const kisiBazliTakip = Boolean(body.kisiBazliTakip) && Boolean(varyant);
  if (body.kisiBazliTakip && !varyant) {
    return NextResponse.json(
      {
        error:
          "Kişiye özel link için SMS50 test harfi (a–z) seçilmeli.",
      },
      { status: 400 }
    );
  }

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

  const tempo = topluSmsTempoNormalize(
    kisiBazliTakip
      ? { ...(body.tempo ?? {}), partiBoyutu: 1 }
      : (body.tempo ?? {})
  );

  let baslangicAt: string | null = null;
  if (typeof body.baslangicAt === "string" && body.baslangicAt.trim()) {
    const t = new Date(body.baslangicAt.trim()).getTime();
    if (!Number.isFinite(t)) {
      return NextResponse.json(
        { error: "Geçersiz başlangıç zamanı." },
        { status: 400 }
      );
    }
    if (t <= Date.now() + 30_000) {
      return NextResponse.json(
        { error: "Zamanlanmış başlangıç en az ~1 dakika sonra olmalı." },
        { status: 400 }
      );
    }
    const maxMs = 30 * 24 * 60 * 60 * 1000;
    if (t - Date.now() > maxMs) {
      return NextResponse.json(
        { error: "Başlangıç en fazla 30 gün sonrası olabilir." },
        { status: 400 }
      );
    }
    baslangicAt = new Date(t).toISOString();
  }

  const adlar = body.adlar ?? {};
  const is = await olusturTopluSmsIsi({
    gonderenEposta: user.email,
    mesaj,
    mesajParca: mesajKontrol.parca,
    mesajBirim: mesajKontrol.birim,
    kampanyaKodu,
    varyant,
    oncekiAtlandi,
    tempo,
    kisiBazliTakip,
    baslangicAt,
    alicilar: benzersiz.map((telefon) => ({
      telefon,
      ad: adlar[telefon] ?? null,
    })),
  });

  after(() => {
    void tetikleTopluSmsKuyruk();
  });

  return NextResponse.json({
    is,
    gecersizAtlandi: gecersiz.length,
    oncekiAtlandi,
    mesajBirim: mesajKontrol.birim,
    mesajParca: mesajKontrol.parca,
    kampanyaKodu,
    varyant,
    kisiBazliTakip,
    gecmisUyari: gecmisVar ? undefined : MIGRATION_027_MESAJ,
  });
}
