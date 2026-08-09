import { NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import {
  duyuruSablonAlanDogrula,
  listeAktifHizmetVerenDuyuruSablonlari,
  listeHizmetVerenDuyuruSablonlari,
  MIGRATION_060_MESAJ,
  olusturHizmetVerenDuyuruSablon,
  hizmetVerenDuyuruSablonTablosuVar,
} from "@/lib/hizmet-veren-duyuru-db";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

export async function GET(request: Request) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const base = smsBaseUrl(new URL(request.url).origin);
  const ayarlarUrl = `${base}/cekici/panel?tab=ayarlar`;

  try {
    const sablonlar = await listeAktifHizmetVerenDuyuruSablonlari(ayarlarUrl);
    let tumSablonlar: Awaited<
      ReturnType<typeof listeHizmetVerenDuyuruSablonlari>
    > = [];
    const tabloVar = await hizmetVerenDuyuruSablonTablosuVar();
    if (tabloVar) {
      tumSablonlar = await listeHizmetVerenDuyuruSablonlari();
    }

    const cekiciler = await getCekiciler();
    const alicilar = cekiciler
      .filter((c) => c.aktif && !c.testerHesap && telefonGecerliMi(c.telefon))
      .map((c) => ({
        id: c.id,
        ad: c.ad,
        telefon: telefonNormalize(c.telefon),
      }));

    return NextResponse.json({
      sablonlar,
      tumSablonlar,
      tabloVar,
      ayarlarUrl,
      aliciSayisi: alicilar.length,
      testerHaric: true,
      testerSayisi: cekiciler.filter((c) => c.testerHesap).length,
      alicilar,
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Yüklenemedi.";
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    return NextResponse.json({ error: MIGRATION_060_MESAJ }, { status: 503 });
  }

  let body: {
    etiket?: string;
    aciklama?: string;
    govde?: string;
    bolumler?: string[] | null;
    sira?: number;
    aktif?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const dogrulama = duyuruSablonAlanDogrula(body);
  if ("error" in dogrulama) {
    return NextResponse.json({ error: dogrulama.error }, { status: 400 });
  }

  try {
    const sablon = await olusturHizmetVerenDuyuruSablon({
      etiket: dogrulama.etiket,
      aciklama: dogrulama.aciklama,
      govde: dogrulama.govde,
      bolumler: dogrulama.bolumler,
      sira: dogrulama.sira,
      aktif: body.aktif !== false,
    });
    return NextResponse.json({ sablon }, { status: 201 });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Şablon oluşturulamadı.";
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}
