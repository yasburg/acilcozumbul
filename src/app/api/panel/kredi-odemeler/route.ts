import { NextRequest, NextResponse } from "next/server";
import { listeleAbonelikIslemleriTahsilat } from "@/lib/abonelik-db";
import { getCekiciById } from "@/lib/db";
import { listeleFaturaLinkSon } from "@/lib/fatura-link-db";
import { listeleKrediOdemeler } from "@/lib/kredi-odeme";
import {
  abonelikIslemDetayId,
  krediOdemeAbonelikMi,
  satinAlmaFaturaDurumunaGoreSirala,
  satinAlmaFiltreParse,
  satinAlmaTipEtiket,
  satinAlmaTipFiltreyeUyar,
  type SatinAlmaTip,
} from "@/lib/panel-satin-almalar";

export type SatinAlmaOzetDto = {
  id: string;
  kaynak: "kredi_odeme" | "abonelik_islem";
  tip: SatinAlmaTip;
  tipEtiket: string;
  cekiciId: string;
  cekiciAd: string;
  cekiciTelefon: string;
  miktar: number;
  tutar: number;
  paketTl: number;
  faturaEposta: string;
  kurumsal: boolean;
  sirketUnvan?: string;
  odemeReferans?: string;
  demoOdeme: boolean;
  olusturulma: string;
  faturaYuklu: boolean;
};

export async function GET(request: NextRequest) {
  const filtre = satinAlmaFiltreParse(
    request.nextUrl.searchParams.get("tip")
  );

  const [krediListe, abonelikIslemleri, faturaLinkleri] = await Promise.all([
    listeleKrediOdemeler(),
    listeleAbonelikIslemleriTahsilat(),
    listeleFaturaLinkSon(500),
  ]);

  const createdOrderIds = new Set(
    abonelikIslemleri
      .filter((i) => i.tip === "created" && i.garantiOrderId)
      .map((i) => i.garantiOrderId as string)
  );
  const faturaOdemeIds = new Set(
    faturaLinkleri
      .map((f) => f.krediOdemeId)
      .filter((x): x is string => Boolean(x))
  );

  const ozet: SatinAlmaOzetDto[] = [];

  for (const k of krediListe) {
    const tip: SatinAlmaTip = krediOdemeAbonelikMi(k, createdOrderIds)
      ? "abonelik"
      : "kredi";
    if (!satinAlmaTipFiltreyeUyar(tip, filtre)) continue;

    ozet.push({
      id: k.id,
      kaynak: "kredi_odeme",
      tip,
      tipEtiket: satinAlmaTipEtiket(tip),
      cekiciId: k.cekiciId,
      cekiciAd: k.cekiciAd,
      cekiciTelefon: k.cekiciTelefon,
      miktar: k.miktar,
      tutar: k.tutar,
      paketTl: k.paketTl,
      faturaEposta: k.faturaEposta ?? "",
      kurumsal: k.kurumsal,
      sirketUnvan: k.sirketUnvan,
      odemeReferans: k.odemeReferans,
      demoOdeme: k.demoOdeme,
      olusturulma: k.olusturulma,
      faturaYuklu: faturaOdemeIds.has(k.id),
    });
  }

  // Yenilemeler kredi_odemeler'de yok; created zaten orada (çift sayma yok)
  for (const i of abonelikIslemleri) {
    if (i.tip !== "renewal") continue;
    const tip: SatinAlmaTip = "abonelik_yenileme";
    if (!satinAlmaTipFiltreyeUyar(tip, filtre)) continue;

    const cekici = await getCekiciById(i.cekiciId);
    ozet.push({
      id: abonelikIslemDetayId(i.id),
      kaynak: "abonelik_islem",
      tip,
      tipEtiket: satinAlmaTipEtiket(tip),
      cekiciId: i.cekiciId,
      cekiciAd: cekici?.ad ?? "—",
      cekiciTelefon: cekici?.telefon ?? "—",
      miktar: i.kredi,
      tutar: i.tutarTl,
      paketTl: i.tutarTl,
      faturaEposta: cekici?.faturaEposta ?? "",
      kurumsal: false,
      odemeReferans: i.garantiOrderId,
      demoOdeme: false,
      olusturulma: i.createdAt,
      faturaYuklu: false,
    });
  }

  ozet.sort(
    (a, b) =>
      Date.parse(b.olusturulma) - Date.parse(a.olusturulma) ||
      a.id.localeCompare(b.id)
  );

  return NextResponse.json(satinAlmaFaturaDurumunaGoreSirala(ozet));
}
