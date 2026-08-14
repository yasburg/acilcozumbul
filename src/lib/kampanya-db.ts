import { getSupabaseAdmin } from "./supabase/admin";
import type { KampanyaKodu } from "./kampanya-kodu";
import { kampanyaKoduNormalize } from "./kampanya-kodu";

type KampanyaRow = {
  kod: string;
  yeni_uye_kredi: number;
  kanal: string | null;
  aciklama: string | null;
  baslangic: string | null;
  bitis: string | null;
  max_kullanim: number | null;
  kullanim_sayisi: number;
  aktif: boolean;
  olusturulma: string;
};

function rowToKampanya(r: KampanyaRow): KampanyaKodu {
  return {
    kod: r.kod,
    yeniUyeKredi: Number(r.yeni_uye_kredi),
    kanal: r.kanal ?? undefined,
    aciklama: r.aciklama ?? undefined,
    baslangic: r.baslangic ?? undefined,
    bitis: r.bitis ?? undefined,
    maxKullanim: r.max_kullanim ?? undefined,
    kullanimSayisi: r.kullanim_sayisi,
    aktif: r.aktif,
    olusturulma: r.olusturulma,
  };
}

function kampanyaToRow(
  k: Omit<KampanyaKodu, "kullanimSayisi" | "olusturulma"> & {
    kullanimSayisi?: number;
    olusturulma?: string;
  }
): KampanyaRow {
  return {
    kod: k.kod,
    yeni_uye_kredi: k.yeniUyeKredi,
    kanal: k.kanal ?? null,
    aciklama: k.aciklama ?? null,
    baslangic: k.baslangic ?? null,
    bitis: k.bitis ?? null,
    max_kullanim: k.maxKullanim ?? null,
    kullanim_sayisi: k.kullanimSayisi ?? 0,
    aktif: k.aktif,
    olusturulma: k.olusturulma ?? new Date().toISOString(),
  };
}

export async function getKampanyaByKod(
  ham: string
): Promise<KampanyaKodu | undefined> {
  const kod = kampanyaKoduNormalize(ham);
  const { data, error } = await getSupabaseAdmin()
    .from("kampanya_kodlari")
    .select("*")
    .eq("kod", kod)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToKampanya(data as KampanyaRow) : undefined;
}

export async function getKampanyalar(): Promise<KampanyaKodu[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("kampanya_kodlari")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (error) throw error;
  return (data as KampanyaRow[]).map(rowToKampanya);
}

export async function ekleKampanya(
  kampanya: Omit<KampanyaKodu, "kullanimSayisi" | "olusturulma">
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("kampanya_kodlari")
    .insert(kampanyaToRow(kampanya));
  if (error) throw error;
}

export type KampanyaGuncellePatch = {
  yeniUyeKredi?: number;
  kanal?: string | null;
  aciklama?: string | null;
  baslangic?: string | null;
  bitis?: string | null;
  maxKullanim?: number | null;
  aktif?: boolean;
};

export async function guncelleKampanya(
  kod: string,
  patch: KampanyaGuncellePatch
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.yeniUyeKredi != null) row.yeni_uye_kredi = patch.yeniUyeKredi;
  if (patch.kanal !== undefined) row.kanal = patch.kanal ?? null;
  if (patch.aciklama !== undefined) row.aciklama = patch.aciklama ?? null;
  if (patch.baslangic !== undefined) row.baslangic = patch.baslangic ?? null;
  if (patch.bitis !== undefined) row.bitis = patch.bitis ?? null;
  if (patch.maxKullanim !== undefined) row.max_kullanim = patch.maxKullanim;
  if (patch.aktif !== undefined) row.aktif = patch.aktif;

  if (Object.keys(row).length === 0) return;

  const { error } = await getSupabaseAdmin()
    .from("kampanya_kodlari")
    .update(row)
    .eq("kod", kampanyaKoduNormalize(kod));
  if (error) throw error;
}

export async function kaydetKampanyaKullanim(kayit: {
  kampanyaKodu: string;
  yeniCekiciId: string;
  verilenKredi: number;
}): Promise<void> {
  const kod = kampanyaKoduNormalize(kayit.kampanyaKodu);
  const sb = getSupabaseAdmin();

  const { error: insertErr } = await sb.from("kampanya_kullanimlari").insert({
    kampanya_kodu: kod,
    yeni_cekici_id: kayit.yeniCekiciId,
    verilen_kredi: kayit.verilenKredi,
  });
  if (insertErr) throw insertErr;

  const { data: mevcut, error: readErr } = await sb
    .from("kampanya_kodlari")
    .select("kullanim_sayisi")
    .eq("kod", kod)
    .single();
  if (readErr) throw readErr;

  const { error: updateErr } = await sb
    .from("kampanya_kodlari")
    .update({ kullanim_sayisi: (mevcut.kullanim_sayisi ?? 0) + 1 })
    .eq("kod", kod);
  if (updateErr) throw updateErr;
}

export type KampanyaKullanimSatir = {
  id: string;
  kampanyaKodu: string;
  yeniCekiciId: string;
  yeniCekiciAd?: string;
  verilenKredi: number;
  olusturulma: string;
};

export async function getKampanyaKullanimlari(): Promise<KampanyaKullanimSatir[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("kampanya_kullanimlari")
    .select("*")
    .order("olusturulma", { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const cekiciIds = [...new Set(rows.map((r: any) => r.yeni_cekici_id as string))];
  const { data: cekiciler, error: cErr } = await getSupabaseAdmin()
    .from("cekiciler")
    .select("id, ad")
    .in("id", cekiciIds);
  if (cErr) throw cErr;

  const adMap = new Map(
    (cekiciler ?? []).map((c: { id: string; ad: string }) => [c.id, c.ad])
  );

  return rows.map(
    (r: {
      id: string;
      kampanya_kodu: string;
      yeni_cekici_id: string;
      verilen_kredi: number;
      olusturulma: string;
    }) => ({
      id: r.id,
      kampanyaKodu: r.kampanya_kodu,
      yeniCekiciId: r.yeni_cekici_id,
      yeniCekiciAd: adMap.get(r.yeni_cekici_id),
      verilenKredi: Number(r.verilen_kredi),
      olusturulma: r.olusturulma,
    })
  );
}
