import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { epostaGecerliMi, epostaNormalize } from "@/lib/eposta";
import { garantiYapilandirildi } from "@/lib/garanti/config";
import { olusturBekleyenRozetOdeme } from "@/lib/odeme";
import {
  ROZET_INDIRIMLI_FIYAT_TL,
  ROZET_LISTE_FIYAT_TL,
  rozetIndirimYuzde,
} from "@/lib/rozet";
import { ensureSeedData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (cekici.rozetAktif) {
    return NextResponse.json(
      { error: "Onaylı çekici rozetiniz zaten aktif." },
      { status: 400 }
    );
  }

  if (cekici.belgeDurum !== "onaylandi") {
    return NextResponse.json(
      {
        error:
          cekici.belgeDurum === "beklemede"
            ? "Belgeleriniz henüz onaylanmadı."
            : "Önce ruhsat ve çekici belgenizi yükleyip onay alın.",
      },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const epostaHam = String(body.eposta ?? cekici.faturaEposta ?? "").trim();
  if (epostaHam && !epostaGecerliMi(epostaHam)) {
    return NextResponse.json(
      { error: "Geçerli bir fatura e-postası girin." },
      { status: 400 }
    );
  }
  const eposta = epostaHam ? epostaNormalize(epostaHam) : "";

  const odeme = await olusturBekleyenRozetOdeme(cekici.id, eposta);

  return NextResponse.json({
    odemeId: odeme.id,
    tutar: odeme.tutar,
    listeFiyati: odeme.listeFiyati ?? ROZET_LISTE_FIYAT_TL,
    indirimYuzde: rozetIndirimYuzde(),
    odemeTipi: "rozet",
    garantiAktif: garantiYapilandirildi(),
  });
}
