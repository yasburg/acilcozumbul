import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, getTalepById } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { aktifTeklifler, ihaleAcikMi } from "@/lib/ihale";
import {
  getDegerlendirmeByTalepId,
  memnuniyetDurumuHesapla,
  memnuniyetSmsGonderGerekirse,
} from "@/lib/memnuniyet";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { demoTalepGetir, isDemoTalepId } from "@/lib/demo-oturum";
import { demoMusteriTalepDurumJson } from "@/lib/demo-responses";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;

  if (isDemoTalepId(id)) {
    const demoCtx = await demoTalepGetir(id, request);
    if (!demoCtx) {
      return NextResponse.json(
        { error: "Demo oturumu bulunamadı.", demoHatasi: true },
        { status: 404 }
      );
    }
    let cekiciAd: string | undefined;
    if (demoCtx.talep.kazananCekiciId) {
      const kazanan = demoCtx.talep.teklifler?.find(
        (t) => t.cekiciId === demoCtx.talep.kazananCekiciId
      );
      if (kazanan) {
        cekiciAd = kazanan.cekiciAd.split(" ")[0];
      } else {
        const cekici = await getCekiciById(demoCtx.talep.kazananCekiciId);
        cekiciAd = cekici?.ad;
      }
    }
    return NextResponse.json(
      demoMusteriTalepDurumJson(demoCtx.talep, cekiciAd)
    );
  }

  const talep = await getTalepById(id);

  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const teklifler = aktifTeklifler(talep);
  const kazananSecildi = !!talep.kazananCekiciId;
  const anlasmaBekliyor =
    kazananSecildi && talep.durum === "kazanan_belli" && talep.anlasmaDurumu !== "anlaşıldı";
  const yenidenAranıyor = talep.durum === "yeniden_ihalede";
  const tamamlandi = talep.durum === "anlaşıldı";
  const ihaleAcik = ihaleAcikMi(talep);

  let cekiciAd: string | undefined;
  if (talep.kazananCekiciId) {
    const cekici = await getCekiciById(talep.kazananCekiciId);
    cekiciAd = cekici?.ad;
  }

  const kazananTeklif = talep.kazananTeklifId
    ? talep.teklifler?.find((t) => t.id === talep.kazananTeklifId)
    : undefined;

  const degerlendirme = await getDegerlendirmeByTalepId(id);
  const memnuniyet = memnuniyetDurumuHesapla(talep, degerlendirme);

  if (memnuniyet.formAcik) {
    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    await memnuniyetSmsGonderGerekirse(talep, baseUrl).catch(() => {});
  }

  return NextResponse.json({
    id: talep.id,
    durum: talep.durum,
    ihaleAcik,
    ihaleBitis: talep.ihaleBitis,
    teklifSayisi: teklifler.length,
    bildirilenSayisi: talep.bildirilenCekiciIds?.length ?? 0,
    kazananSecildi,
    anlasmaBekliyor,
    yenidenAranıyor,
    tamamlandi,
    cekiciAd,
    kazananFiyat: kazananTeklif?.fiyat,
    anlasmaDurumu: talep.anlasmaDurumu,
    konum: talep.konum,
    hedefKonum: talep.hedefKonum,
    sorunTipi: talep.sorunTipi ?? null,
    memnuniyet,
  });
}
