import { NextRequest, NextResponse } from "next/server";
import { listeleAbonelikIslemleriTahsilat } from "@/lib/abonelik-db";
import { getCekiciById } from "@/lib/db";
import { listeleFaturaLinkSon } from "@/lib/fatura-link-db";
import { orderIdTemizle } from "@/lib/garanti/payment";
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
  cekiciSehir: string;
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

  const cekiciCache = new Map<
    string,
    Awaited<ReturnType<typeof getCekiciById>>
  >();
  async function cekiciAl(id: string) {
    if (!cekiciCache.has(id)) {
      cekiciCache.set(id, await getCekiciById(id));
    }
    return cekiciCache.get(id);
  }

  const ozet: SatinAlmaOzetDto[] = [];

  for (const k of krediListe) {
    const tip: SatinAlmaTip = krediOdemeAbonelikMi(k, createdOrderIds)
      ? "abonelik"
      : "kredi";
    if (!satinAlmaTipFiltreyeUyar(tip, filtre)) continue;

    const cekici = await cekiciAl(k.cekiciId);
    ozet.push({
      id: k.id,
      kaynak: "kredi_odeme",
      tip,
      tipEtiket: satinAlmaTipEtiket(tip),
      cekiciId: k.cekiciId,
      cekiciAd: k.cekiciAd,
      cekiciTelefon: k.cekiciTelefon,
      cekiciSehir: cekici?.sehir?.trim() || "",
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

  // Yenilemeler kredi_odemeler'de yok. Created genelde orada; yoksa (kayıt hatası) yine göster.
  const krediIdsTemiz = new Set(krediListe.map((k) => orderIdTemizle(k.id)));
  for (const i of abonelikIslemleri) {
    const yenileme = i.tip === "renewal";
    const eksikCreated =
      i.tip === "created" &&
      Boolean(i.garantiOrderId) &&
      !krediIdsTemiz.has(orderIdTemizle(i.garantiOrderId as string));
    if (!yenileme && !eksikCreated) continue;

    const tip: SatinAlmaTip = yenileme ? "abonelik_yenileme" : "abonelik";
    if (!satinAlmaTipFiltreyeUyar(tip, filtre)) continue;

    const cekici = await cekiciAl(i.cekiciId);
    ozet.push({
      id: abonelikIslemDetayId(i.id),
      kaynak: "abonelik_islem",
      tip,
      tipEtiket: satinAlmaTipEtiket(tip),
      cekiciId: i.cekiciId,
      cekiciAd: cekici?.ad ?? "—",
      cekiciTelefon: cekici?.telefon ?? "—",
      cekiciSehir: cekici?.sehir?.trim() || "",
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
