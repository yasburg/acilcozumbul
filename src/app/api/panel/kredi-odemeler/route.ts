import { NextRequest, NextResponse } from "next/server";
import { listeleAbonelikIslemleriTahsilat } from "@/lib/abonelik-db";
import { getCekiciById } from "@/lib/db";
import { listeleFaturaLinkSon } from "@/lib/fatura-link-db";
import { trendyolFaturaUuidDurumu } from "@/lib/fatura-trendyol";
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
import { senkronizeTamamlananRozetOdemeleri } from "@/lib/rozet-satin-alma-senkron";

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
  /** Geçerli (iptal olmayan) PDF var */
  faturaYuklu: boolean;
  /** PDF var ama Trendyol’da iptal */
  faturaIptal: boolean;
};

export async function GET(request: NextRequest) {
  const filtre = satinAlmaFiltreParse(
    request.nextUrl.searchParams.get("tip")
  );

  await senkronizeTamamlananRozetOdemeleri().catch((e) =>
    console.error("[panel/kredi-odemeler] rozet senkron", e)
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

  const faturaByOdeme = new Map<
    string,
    (typeof faturaLinkleri)[number]
  >();
  for (const f of faturaLinkleri) {
    if (f.krediOdemeId) faturaByOdeme.set(f.krediOdemeId, f);
  }

  const uuidDurum = new Map<string, "iptal" | "aktif" | null>();
  const uniqueUuids = [
    ...new Set(
      faturaLinkleri
        .map((f) => f.trendyolInvoiceUuid?.trim())
        .filter((u): u is string => Boolean(u))
    ),
  ];
  await Promise.all(
    uniqueUuids.map(async (uuid) => {
      const d = await trendyolFaturaUuidDurumu(uuid);
      uuidDurum.set(
        uuid,
        d?.durum === "iptal" || d?.durum === "aktif" ? d.durum : null
      );
    })
  );

  function faturaDurumu(odemeId: string): {
    yuklu: boolean;
    iptal: boolean;
  } {
    const f = faturaByOdeme.get(odemeId);
    if (!f) return { yuklu: false, iptal: false };
    const uuid = f.trendyolInvoiceUuid?.trim();
    if (!uuid) return { yuklu: true, iptal: false };
    if (uuidDurum.get(uuid) === "iptal") return { yuklu: false, iptal: true };
    return { yuklu: true, iptal: false };
  }

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
    const tip: SatinAlmaTip =
      k.odemeTipi === "rozet"
        ? "rozet"
        : krediOdemeAbonelikMi(k, createdOrderIds)
          ? "abonelik"
          : "kredi";
    if (!satinAlmaTipFiltreyeUyar(tip, filtre)) continue;

    const cekici = await cekiciAl(k.cekiciId);
    const { yuklu, iptal } = faturaDurumu(k.id);
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
      faturaYuklu: yuklu,
      faturaIptal: iptal,
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
      faturaIptal: false,
    });
  }

  ozet.sort(
    (a, b) =>
      Date.parse(b.olusturulma) - Date.parse(a.olusturulma) ||
      a.id.localeCompare(b.id)
  );

  return NextResponse.json(satinAlmaFaturaDurumunaGoreSirala(ozet));
}
