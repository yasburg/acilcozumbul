import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { getCekiciByDavetKodu, setCekiciDavetKodu } from "@/lib/db";
import {
  DAVET_EDEN_BONUS_KREDI,
  DAVETLI_BONUS_KREDI,
  davetKoduGecerliMi,
  davetKoduOner,
} from "@/lib/davet-kodu";
import {
  davetKoduSutunuVar,
  MIGRATION_013_MESAJ,
} from "@/lib/supabase/davet-schema";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await davetKoduSutunuVar())) {
    return NextResponse.json(
      { error: MIGRATION_013_MESAJ, schemaUyari: MIGRATION_013_MESAJ },
      { status: 503 }
    );
  }

  return NextResponse.json({
    davetKodu: cekici.davetKodu ?? null,
    davetliBonus: DAVETLI_BONUS_KREDI,
    davetEdenBonus: DAVET_EDEN_BONUS_KREDI,
    kayitLink: cekici.davetKodu
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acilcozumbul.com"}/cekici/kayit?davet=${encodeURIComponent(cekici.davetKodu)}`
      : null,
  });
}

export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await davetKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_013_MESAJ }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const ham =
    typeof body.davetKodu === "string" && body.davetKodu.trim()
      ? body.davetKodu
      : body.olustur === true
        ? davetKoduOner(cekici.ad)
        : "";

  if (!ham) {
    return NextResponse.json(
      { error: "Davet kodu girin veya otomatik oluşturun." },
      { status: 400 }
    );
  }

  const dogrulama = davetKoduGecerliMi(ham);
  if (!dogrulama.ok || !dogrulama.kod) {
    return NextResponse.json(
      { error: dogrulama.hata ?? "Geçersiz davet kodu." },
      { status: 400 }
    );
  }

  if (cekici.davetKodu && cekici.davetKodu !== dogrulama.kod) {
    return NextResponse.json(
      { error: "Davet kodunuz zaten oluşturulmuş; değiştirilemez." },
      { status: 409 }
    );
  }

  const baska = await getCekiciByDavetKodu(dogrulama.kod);
  if (baska && baska.id !== cekici.id) {
    return NextResponse.json(
      { error: "Bu kod başka bir hesap tarafından kullanılıyor." },
      { status: 409 }
    );
  }

  await setCekiciDavetKodu(cekici.id, dogrulama.kod);

  return NextResponse.json({
    davetKodu: dogrulama.kod,
    mesaj: "Davet kodunuz hazır. Paylaştığınız her kayıt size 10, yeni üyeye 20 kredi kazandırır.",
    kayitLink: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acilcozumbul.com"}/cekici/kayit?davet=${encodeURIComponent(dogrulama.kod)}`,
  });
}
