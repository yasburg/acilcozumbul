import {
  DAVET_EDEN_BONUS_KREDI,
  DAVETLI_BONUS_KREDI,
} from "./davet-kodu";
import { getSupabaseAdmin } from "./supabase/admin";

export interface DavetKullanimSatir {
  id: string;
  davetKodu: string;
  davetEdenId: string;
  davetEdenAd?: string;
  yeniCekiciId: string;
  yeniCekiciAd?: string;
  davetliKredi: number;
  davetEdenKredi: number;
  olusturulma: string;
}

export interface DavetLiderSatir {
  cekiciId: string;
  cekiciAd: string;
  kullanimSayisi: number;
  toplamKazandigiKredi: number;
  davetKodu?: string;
}

export interface DavetPanelOzet {
  toplamKullanim: number;
  aktifKodSayisi: number;
  toplamDavetliKredi: number;
  toplamDavetEdenKredi: number;
  bonusDavetli: number;
  bonusDavetEden: number;
}

type DavetKullanimRow = {
  id: string;
  davet_kodu: string;
  davet_eden_id: string;
  yeni_cekici_id: string;
  davetli_kredi: number;
  davet_eden_kredi: number;
  olusturulma: string;
};

function rowToSatir(
  r: DavetKullanimRow,
  cekiciAdMap: Map<string, string>
): DavetKullanimSatir {
  return {
    id: r.id,
    davetKodu: r.davet_kodu,
    davetEdenId: r.davet_eden_id,
    davetEdenAd: cekiciAdMap.get(r.davet_eden_id),
    yeniCekiciId: r.yeni_cekici_id,
    yeniCekiciAd: cekiciAdMap.get(r.yeni_cekici_id),
    davetliKredi: Number(r.davetli_kredi),
    davetEdenKredi: Number(r.davet_eden_kredi),
    olusturulma: r.olusturulma,
  };
}

export async function getDavetPanelVerisi(): Promise<{
  liste: DavetKullanimSatir[];
  ozet: DavetPanelOzet;
  liderler: DavetLiderSatir[];
}> {
  const sb = getSupabaseAdmin();

  const [{ data: kullanimlar, error: kErr }, { count: aktifKodSayisi, error: aErr }] =
    await Promise.all([
      sb
        .from("davet_kullanimlari")
        .select("*")
        .order("olusturulma", { ascending: false }),
      sb
        .from("cekiciler")
        .select("id", { count: "exact", head: true })
        .not("davet_kodu", "is", null),
    ]);

  if (kErr) throw kErr;
  if (aErr) throw aErr;

  const rows = (kullanimlar ?? []) as DavetKullanimRow[];

  const cekiciIds = [
    ...new Set(
      rows.flatMap((r) => [r.davet_eden_id, r.yeni_cekici_id])
    ),
  ];

  let cekiciAdMap = new Map<string, string>();
  let kodMap = new Map<string, string>();

  if (cekiciIds.length > 0) {
    const { data: cekiciler, error: cErr } = await sb
      .from("cekiciler")
      .select("id, ad, davet_kodu")
      .in("id", cekiciIds);
    if (cErr) throw cErr;

    cekiciAdMap = new Map(
      (cekiciler ?? []).map((c: { id: string; ad: string }) => [c.id, c.ad])
    );
    kodMap = new Map(
      (cekiciler ?? []).map(
        (c: { id: string; davet_kodu: string | null }) => [
          c.id,
          c.davet_kodu ?? "",
        ]
      )
    );
  }

  const liste = rows.map((r) => rowToSatir(r, cekiciAdMap));

  const liderMap = new Map<
    string,
    { kullanimSayisi: number; toplamKazandigiKredi: number }
  >();
  for (const r of rows) {
    const mevcut = liderMap.get(r.davet_eden_id) ?? {
      kullanimSayisi: 0,
      toplamKazandigiKredi: 0,
    };
    mevcut.kullanimSayisi += 1;
    mevcut.toplamKazandigiKredi += Number(r.davet_eden_kredi);
    liderMap.set(r.davet_eden_id, mevcut);
  }

  const liderler: DavetLiderSatir[] = [...liderMap.entries()]
    .map(([cekiciId, stats]) => ({
      cekiciId,
      cekiciAd: cekiciAdMap.get(cekiciId) ?? cekiciId,
      kullanimSayisi: stats.kullanimSayisi,
      toplamKazandigiKredi: stats.toplamKazandigiKredi,
      davetKodu: kodMap.get(cekiciId) || undefined,
    }))
    .sort((a, b) => b.kullanimSayisi - a.kullanimSayisi);

  const toplamDavetliKredi = rows.reduce(
    (s, r) => s + Number(r.davetli_kredi),
    0
  );
  const toplamDavetEdenKredi = rows.reduce(
    (s, r) => s + Number(r.davet_eden_kredi),
    0
  );

  return {
    liste,
    liderler,
    ozet: {
      toplamKullanim: rows.length,
      aktifKodSayisi: aktifKodSayisi ?? 0,
      toplamDavetliKredi,
      toplamDavetEdenKredi,
      bonusDavetli: DAVETLI_BONUS_KREDI,
      bonusDavetEden: DAVET_EDEN_BONUS_KREDI,
    },
  };
}
