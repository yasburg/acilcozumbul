import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ilceListesi } from "@/lib/il-ilce";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const tumIlceler = ilceListesi(cekici.sehir);

  return NextResponse.json({
    il: cekici.sehir,
    tumIlceler,
    seciliIlceler: cekici.hizmetIlceleri ?? [],
  });
}

export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { ilceler } = await request.json();
  if (!Array.isArray(ilceler)) {
    return NextResponse.json({ error: "ilceler dizisi gerekli." }, { status: 400 });
  }

  const gecerli = new Set(ilceListesi(cekici.sehir));
  const secili = (ilceler as string[])
    .map((i) => i.trim())
    .filter((i) => gecerli.has(i));

  const benzersiz = [...new Set(secili)].sort((a, b) =>
    a.localeCompare(b, "tr")
  );

  cekici.hizmetIlceleri = benzersiz;
  await updateCekici(cekici);

  return NextResponse.json({
    mesaj:
      benzersiz.length > 0
        ? `${benzersiz.length} ilçe kaydedildi.`
        : "İlçe seçilmedi — bu ilde talep bildirimi almayacaksınız.",
    seciliIlceler: benzersiz,
  });
}
