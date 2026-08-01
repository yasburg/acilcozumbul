import { NextRequest, NextResponse } from "next/server";
import {
  getCekiciByDogrulanmisFaturaEposta,
  getCekiciByTelefon,
} from "@/lib/db";
import { CEKICI_COOKIE, beniAnimsaOku, cekiciOturumCookieAyarlari } from "@/lib/auth";
import { cekiciGirisSifreKontrol } from "@/lib/cekici-auth";
import { ensureSeedData } from "@/lib/seed";
import { epostaGecerliMi, epostaNormalize } from "@/lib/eposta";
import {
  telefonDogrulamaHatasi,
  telefonGecerliMi,
  telefonNormalize,
} from "@/lib/telefon";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const body = await request.json();
  const { telefon, eposta, sifre, beniAnimsa: beniAnimsaHam } = body;
  const sifreDeger = String(sifre ?? "").trim();
  const beniAnimsa = beniAnimsaOku(beniAnimsaHam);

  if (!sifreDeger) {
    return NextResponse.json({ error: "Şifre gerekli." }, { status: 400 });
  }

  const epostaKimlik = epostaGecerliMi(String(eposta ?? ""))
    ? epostaNormalize(String(eposta))
    : epostaGecerliMi(String(telefon ?? ""))
      ? epostaNormalize(String(telefon))
      : null;

  let cekici;
  let epostaGiris = false;

  if (epostaKimlik) {
    epostaGiris = true;
    cekici = await getCekiciByDogrulanmisFaturaEposta(epostaKimlik);
    if (!cekici) {
      return NextResponse.json(
        {
          error:
            "Bu e-posta ile kayıtlı doğrulanmış üye bulunamadı. Önce kredi ödemesinde fatura e-postanızı doğrulayın.",
        },
        { status: 401 }
      );
    }
  } else if (telefon && telefonGecerliMi(telefon)) {
    const tel = telefonNormalize(telefon);
    cekici = await getCekiciByTelefon(tel);
  } else {
    return NextResponse.json(
      {
        error: epostaGecerliMi(String(telefon ?? ""))
          ? "Bu e-posta doğrulanmamış veya kayıtlı değil."
          : telefon
            ? telefonDogrulamaHatasi(telefon)
            : "Telefon veya doğrulanmış e-posta girin.",
      },
      { status: 400 }
    );
  }

  if (!cekici || !cekici.aktif) {
    return NextResponse.json({ error: "Geçersiz giriş." }, { status: 401 });
  }

  const sifreOk = await cekiciGirisSifreKontrol(cekici, sifreDeger);
  if (!sifreOk) {
    return NextResponse.json(
      {
        error: epostaGiris
          ? "E-posta veya şifre hatalı."
          : "Telefon veya şifre hatalı.",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    id: cekici.id,
    ad: cekici.ad,
    kredi: cekiciToplamKredi(cekici),
  });

  response.cookies.set(
    CEKICI_COOKIE,
    cekici.token,
    cekiciOturumCookieAyarlari(beniAnimsa)
  );

  return response;
}
