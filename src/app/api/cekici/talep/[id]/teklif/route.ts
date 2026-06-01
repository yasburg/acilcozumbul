import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { cekiciTalepBolgesineUygunMu } from "@/lib/cekici-bolge";
import { cekiciTalepSorununaUygunMu } from "@/lib/cekici-sorun";
import { cekiciHaricMi, cekiciTeklifVerebilirMi } from "@/lib/ihale";
import { talepBolge, talepSorunOzet } from "@/lib/talep-utils";
import type { Teklif } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const fiyat = Number(body.fiyat);
  const tahminiSureDk = Number(body.tahminiSureDk) || 30;
  const mesaj = body.mesaj?.trim();

  if (!fiyat || fiyat < 100) {
    return NextResponse.json(
      { error: "Geçerli bir fiyat girin (min. 100 TL)." },
      { status: 400 }
    );
  }

  let talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (cekiciHaricMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Müşteri sizi tercih etmedi.", tercihEdilmedi: true },
      { status: 403 }
    );
  }

  if (!cekiciTalepBolgesineUygunMu(cekici, talep)) {
    return NextResponse.json(
      { error: "Bu talep hizmet bölgelerinizin dışında." },
      { status: 403 }
    );
  }

  if (!cekiciTalepSorununaUygunMu(cekici, talep)) {
    return NextResponse.json(
      {
        error:
          "Bu sorun tipi hesabınızda tanımlı değil. Ayarlardan hizmet verdiğiniz sorunları güncelleyin.",
      },
      { status: 403 }
    );
  }

  if (talep.kazananCekiciId === cekici.id) {
    return NextResponse.json({ kazandim: true, talepId: talep.id });
  }

  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    if (talep.kazananCekiciId) {
      return NextResponse.json(
        { error: "İhale kapandı. Müşteri teklif seçti." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Bu talebe artık teklif verilemez." },
      { status: 409 }
    );
  }

  talep = (await getTalepById(id))!;
  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Bu talebe az önce teklif verildi veya ihale kapandı." },
      { status: 409 }
    );
  }

  const teklif: Teklif = {
    id: randomUUID(),
    cekiciId: cekici.id,
    cekiciAd: cekici.ad,
    fiyat,
    ilkFiyat: fiyat,
    fiyatDegisti: false,
    tahminiSureDk,
    mesaj,
    tarih: new Date().toISOString(),
    durum: "aktif",
  };

  talep.teklifler = [...(talep.teklifler ?? []), teklif];

  await updateTalep(talep);

  return NextResponse.json({
    teklifId: teklif.id,
    kredi: cekici.kredi,
    mesaj: "Teklifiniz alındı. Ücretsiz — müşteri seçim yapana kadar bekleyin.",
    onizleme: {
      bolge: talepBolge(talep),
      sorunOzet: talepSorunOzet(talep.sorun),
    },
  });
}

/** Aktif teklif fiyatını güncelle — müşteri bu teklifle anlaşamaz */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { id } = await params;
  const { fiyat: yeniFiyat } = await request.json();
  const fiyat = Number(yeniFiyat);

  if (!fiyat || fiyat < 100) {
    return NextResponse.json(
      { error: "Geçerli bir fiyat girin (min. 100 TL)." },
      { status: 400 }
    );
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const teklif = talep.teklifler?.find(
    (t) => t.cekiciId === cekici.id && t.durum === "aktif"
  );
  if (!teklif) {
    return NextResponse.json({ error: "Aktif teklifiniz yok." }, { status: 404 });
  }

  const ilkFiyat = teklif.ilkFiyat ?? teklif.fiyat;
  if (fiyat !== ilkFiyat) {
    teklif.fiyatDegisti = true;
    teklif.fiyatGuncellemeTarihi = new Date().toISOString();
  }
  teklif.fiyat = fiyat;
  if (teklif.ilkFiyat == null) teklif.ilkFiyat = ilkFiyat;

  await updateTalep(talep);

  return NextResponse.json({
    fiyat: teklif.fiyat,
    ilkFiyat: teklif.ilkFiyat,
    fiyatDegisti: teklif.fiyatDegisti === true,
    uyari:
      teklif.fiyatDegisti
        ? "Fiyatı değiştirdiniz. Müşteri bu teklifle sizi seçemez; yalnızca ilk fiyatınız geçerlidir."
        : undefined,
  });
}
