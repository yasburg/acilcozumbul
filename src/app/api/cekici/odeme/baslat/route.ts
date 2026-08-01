import { NextRequest, NextResponse } from "next/server";
import { getAktifAbonelik } from "@/lib/abonelik-db";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciEpostaDogrulandiMi } from "@/lib/cekici-email-otp";
import { epostaNormalize } from "@/lib/eposta";
import { garantiYapilandirildi } from "@/lib/garanti/config";
import {
  krediPaketBul,
  type KrediPaketKaynak,
} from "@/lib/kredi-fiyat";
import { olusturBekleyenOdeme } from "@/lib/odeme";
import { ensureSeedData } from "@/lib/seed";

function kaynakOku(raw: unknown): KrediPaketKaynak | null {
  if (raw === "abonelik" || raw === "kredi") return raw;
  if (raw == null || raw === "") return "kredi";
  return null;
}

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const paketTl = Number(body.paketTl ?? body.miktar);
  const kaynak = kaynakOku(body.kaynak);
  const eposta = epostaNormalize(
    String(body.eposta ?? cekici.faturaEposta ?? "")
  );

  if (!kaynak) {
    return NextResponse.json(
      { error: "Geçerli kaynak seçin (abonelik veya kredi)." },
      { status: 400 }
    );
  }

  if (!krediPaketBul(paketTl, kaynak)) {
    return NextResponse.json(
      { error: "Geçerli bir paket seçin (499, 999 veya 1999 TL)." },
      { status: 400 }
    );
  }

  if (kaynak === "abonelik") {
    const aktif = await getAktifAbonelik(cekici.id);
    if (aktif) {
      return NextResponse.json(
        {
          error:
            "Zaten aktif bir aboneliğiniz var. Önce iptal edin veya yenilemenin tamamlanmasını bekleyin.",
        },
        { status: 409 }
      );
    }
  }

  if (!(await cekiciEpostaDogrulandiMi(cekici.id, eposta))) {
    return NextResponse.json(
      { error: "Ödeme için e-posta adresinizi doğrulayın." },
      { status: 403 }
    );
  }

  const odeme = await olusturBekleyenOdeme(cekici.id, paketTl, eposta, kaynak);

  return NextResponse.json({
    odemeId: odeme.id,
    miktar: odeme.miktar,
    tutar: odeme.tutar,
    listeFiyati: odeme.listeFiyati,
    odemeTipi: odeme.odemeTipi,
    kaynak,
    garantiAktif: garantiYapilandirildi(),
  });
}
