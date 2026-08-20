import { NextResponse } from "next/server";
import { getAbonelikIslemById } from "@/lib/abonelik-db";
import { getCekiciById } from "@/lib/db";
import { orderIdTemizle } from "@/lib/garanti/payment";
import { getFaturaLinkByKrediOdemeId } from "@/lib/fatura-link-db";
import { trendyolOdemeFaturaPanelDurumu } from "@/lib/fatura-trendyol";
import { getKrediOdemeById } from "@/lib/kredi-odeme";
import {
  abonelikIslemIdFromDetay,
  adSoyadAyir,
  satinAlmaTipEtiket,
  type SatinAlmaTip,
} from "@/lib/panel-satin-almalar";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function krediOdemeTipiCoz(
  kayit: { id: string; odemeTipi?: string }
): Promise<SatinAlmaTip> {
  if (kayit.odemeTipi === "abonelik") return "abonelik";
  const temiz = orderIdTemizle(kayit.id);
  const { data } = await getSupabaseAdmin()
    .from("abonelik_islem")
    .select("id")
    .eq("tip", "created")
    .or(`garanti_order_id.eq.${kayit.id},garanti_order_id.eq.${temiz}`)
    .limit(1)
    .maybeSingle();
  if (data) return "abonelik";
  return "kredi";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const islemId = abonelikIslemIdFromDetay(id);

  if (islemId) {
    const islem = await getAbonelikIslemById(islemId);
    if (!islem || (islem.tip !== "renewal" && islem.tip !== "created")) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }
    const cekici = await getCekiciById(islem.cekiciId);
    const tip: SatinAlmaTip =
      islem.tip === "renewal" ? "abonelik_yenileme" : "abonelik";
    const { ad, soyad } = adSoyadAyir(cekici?.ad ?? "");
    return NextResponse.json({
      id,
      kaynak: "abonelik_islem" as const,
      tip,
      tipEtiket: satinAlmaTipEtiket(tip),
      cekiciId: islem.cekiciId,
      cekiciAd: cekici?.ad ?? "—",
      ad,
      soyad,
      cekiciTelefon: cekici?.telefon ?? "—",
      cekiciSehir: cekici?.sehir?.trim() || "",
      miktar: islem.kredi,
      tutar: islem.tutarTl,
      paketTl: islem.tutarTl,
      faturaEposta: cekici?.faturaEposta ?? "",
      faturaAdres: undefined,
      faturaTcKimlik: undefined,
      kurumsal: false,
      sirketUnvan: undefined,
      vergiNo: undefined,
      odemeReferans: islem.garantiOrderId,
      garantiRespCode: undefined,
      demoOdeme: false,
      olusturulma: islem.createdAt,
      fatura: null,
      krediOdemeId: null,
      trendyolFatura: null,
    });
  }

  const kayit = await getKrediOdemeById(id);
  if (!kayit) {
    return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  }

  const tip = await krediOdemeTipiCoz(kayit);
  const { ad, soyad } = adSoyadAyir(kayit.cekiciAd);
  const fatura = await getFaturaLinkByKrediOdemeId(kayit.id);
  const cekici = await getCekiciById(kayit.cekiciId);

  const trendyolFatura =
    fatura != null
      ? await trendyolOdemeFaturaPanelDurumu({ odeme: kayit, fatura })
      : null;

  return NextResponse.json({
    ...kayit,
    kaynak: "kredi_odeme" as const,
    tip,
    tipEtiket: satinAlmaTipEtiket(tip),
    ad,
    soyad,
    cekiciSehir: cekici?.sehir?.trim() || "",
    faturaEposta: kayit.faturaEposta || cekici?.faturaEposta || "",
    fatura: fatura
      ? {
          id: fatura.id,
          belgeNo: fatura.belgeNo,
          createdAt: fatura.createdAt,
        }
      : null,
    krediOdemeId: kayit.id,
    trendyolFatura,
  });
}
