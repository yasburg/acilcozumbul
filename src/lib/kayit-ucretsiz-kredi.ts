import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";

export type KayitUcretsizKrediAyar = {
  aktif: boolean;
  krediMiktar: number;
  guncelleme?: string;
};

export const KAYIT_UCRETSIZ_KREDI_VARSAYILAN: KayitUcretsizKrediAyar = {
  aktif: true,
  krediMiktar: 9,
};

const MIGRATION_066 =
  "066_kayit_ucretsiz_kredi_ayar.sql migration’ını çalıştırın.";

export function kayitUcretsizKrediMigrationMesaji(): string {
  return MIGRATION_066;
}

export async function kayitUcretsizKrediTablosuVar(): Promise<boolean> {
  if (!supabaseDbAktif()) return false;
  const { error } = await getSupabaseAdmin()
    .from("kayit_ucretsiz_kredi_ayar")
    .select("id")
    .limit(1);
  if (!error) return true;
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  if (code === "42P01" || code === "PGRST205") return false;
  throw error;
}

export async function getKayitUcretsizKrediAyar(): Promise<KayitUcretsizKrediAyar> {
  if (!(await kayitUcretsizKrediTablosuVar())) {
    return { ...KAYIT_UCRETSIZ_KREDI_VARSAYILAN };
  }
  const { data, error } = await getSupabaseAdmin()
    .from("kayit_ucretsiz_kredi_ayar")
    .select("aktif, kredi_miktar, guncelleme")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ...KAYIT_UCRETSIZ_KREDI_VARSAYILAN };
  return {
    aktif: Boolean(data.aktif),
    krediMiktar: Math.max(0, Math.floor(Number(data.kredi_miktar) || 0)),
    guncelleme: data.guncelleme ? String(data.guncelleme) : undefined,
  };
}

export async function guncelleKayitUcretsizKrediAyar(opts: {
  aktif?: boolean;
  krediMiktar?: number;
}): Promise<KayitUcretsizKrediAyar> {
  if (!(await kayitUcretsizKrediTablosuVar())) {
    throw new Error(MIGRATION_066);
  }
  const mevcut = await getKayitUcretsizKrediAyar();
  const aktif = opts.aktif ?? mevcut.aktif;
  let krediMiktar = mevcut.krediMiktar;
  if (opts.krediMiktar != null) {
    const n = Math.floor(Number(opts.krediMiktar));
    if (!Number.isFinite(n) || n < 0 || n > 50_000) {
      throw new Error("Kredi miktarı 0–50000 arası olmalı.");
    }
    krediMiktar = n;
  }
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("kayit_ucretsiz_kredi_ayar")
    .upsert({
      id: "default",
      aktif,
      kredi_miktar: krediMiktar,
      guncelleme: now,
    })
    .select("aktif, kredi_miktar, guncelleme")
    .single();
  if (error) throw error;
  return {
    aktif: Boolean(data.aktif),
    krediMiktar: Math.max(0, Math.floor(Number(data.kredi_miktar) || 0)),
    guncelleme: data.guncelleme ? String(data.guncelleme) : now,
  };
}

/** Kodsuz kayıtta uygulanacak kredi (0 = kapalı / yok). */
export async function kayitUcretsizKrediMiktari(): Promise<number> {
  const ayar = await getKayitUcretsizKrediAyar();
  if (!ayar.aktif || ayar.krediMiktar <= 0) return 0;
  return ayar.krediMiktar;
}
