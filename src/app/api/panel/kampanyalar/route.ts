import { NextRequest, NextResponse } from "next/server";
import { getCekiciByDavetKodu } from "@/lib/db";
import {
  ekleKampanya,
  getKampanyaKullanimlari,
  getKampanyalar,
  guncelleKampanya,
} from "@/lib/kampanya-db";
import {
  kampanyaKoduGecerliMi,
  kampanyaKoduNormalize,
} from "@/lib/kampanya-kodu";
import {
  kampanyaKoduSutunuVar,
  MIGRATION_014_MESAJ,
} from "@/lib/supabase/kampanya-schema";

export async function GET() {
  if (!(await kampanyaKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_014_MESAJ }, { status: 503 });
  }

  const [kampanyalar, kullanimlar] = await Promise.all([
    getKampanyalar(),
    getKampanyaKullanimlari(),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acilcozumbul.com";

  return NextResponse.json({
    liste: kampanyalar.map((k) => ({
      ...k,
      kayitLink: `${siteUrl}/kayit/a?kampanya=${encodeURIComponent(k.kod)}`,
    })),
    kullanimlar,
    ozet: {
      toplamKampanya: kampanyalar.length,
      aktifKampanya: kampanyalar.filter((k) => k.aktif).length,
      toplamKullanim: kullanimlar.length,
      toplamVerilenKredi: kullanimlar.reduce((s, u) => s + u.verilenKredi, 0),
    },
  });
}

export async function POST(request: NextRequest) {
  if (!(await kampanyaKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_014_MESAJ }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const ham = typeof body.kod === "string" ? body.kod : "";
  const dogrulama = kampanyaKoduGecerliMi(ham);
  if (!dogrulama.ok || !dogrulama.kod) {
    return NextResponse.json(
      { error: dogrulama.hata ?? "Geçersiz kod." },
      { status: 400 }
    );
  }

  const yeniUyeKredi = Number(body.yeniUyeKredi);
  if (!Number.isFinite(yeniUyeKredi) || yeniUyeKredi <= 0) {
    return NextResponse.json(
      { error: "Geçerli bir kredi miktarı girin." },
      { status: 400 }
    );
  }

  const mevcutDavet = await getCekiciByDavetKodu(dogrulama.kod);
  if (mevcutDavet) {
    return NextResponse.json(
      { error: "Bu kod bir hizmet verenin davet kodu olarak kullanılıyor." },
      { status: 409 }
    );
  }

  try {
    await ekleKampanya({
      kod: dogrulama.kod,
      yeniUyeKredi,
      kanal: typeof body.kanal === "string" ? body.kanal.trim() || undefined : undefined,
      aciklama:
        typeof body.aciklama === "string"
          ? body.aciklama.trim() || undefined
          : undefined,
      baslangic:
        typeof body.baslangic === "string" ? body.baslangic || undefined : undefined,
      bitis: typeof body.bitis === "string" ? body.bitis || undefined : undefined,
      maxKullanim:
        body.maxKullanim != null && body.maxKullanim !== ""
          ? Number(body.maxKullanim)
          : undefined,
      aktif: body.aktif !== false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "Bu kampanya kodu zaten var." },
        { status: 409 }
      );
    }
    throw e;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acilcozumbul.com";

  return NextResponse.json({
    kod: dogrulama.kod,
    mesaj: "Kampanya kodu oluşturuldu.",
    kayitLink: `${siteUrl}/kayit/a?kampanya=${encodeURIComponent(dogrulama.kod)}`,
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await kampanyaKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_014_MESAJ }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const kod =
    typeof body.kod === "string" ? kampanyaKoduNormalize(body.kod) : "";
  if (!kod) {
    return NextResponse.json({ error: "Kod gerekli." }, { status: 400 });
  }

  await guncelleKampanya(kod, {
    aktif: typeof body.aktif === "boolean" ? body.aktif : undefined,
    yeniUyeKredi:
      body.yeniUyeKredi != null ? Number(body.yeniUyeKredi) : undefined,
    kanal: typeof body.kanal === "string" ? body.kanal.trim() : undefined,
    aciklama: typeof body.aciklama === "string" ? body.aciklama.trim() : undefined,
    baslangic:
      body.baslangic === null
        ? undefined
        : typeof body.baslangic === "string"
          ? body.baslangic || undefined
          : undefined,
    bitis:
      body.bitis === null
        ? undefined
        : typeof body.bitis === "string"
          ? body.bitis || undefined
          : undefined,
    maxKullanim:
      body.maxKullanim === null
        ? undefined
        : body.maxKullanim != null
          ? Number(body.maxKullanim)
          : undefined,
  });

  return NextResponse.json({ mesaj: "Kampanya güncellendi." });
}
