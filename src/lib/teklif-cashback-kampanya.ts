import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";

export type TeklifCashbackAyar = {
  aktif: boolean;
  baslangic?: string;
  bitis?: string;
  guncelleme?: string;
};

export type TeklifCashbackDurum = "kapali" | "sure_disi" | "aktif";

export const TEKLIF_CASHBACK_VARSAYILAN: TeklifCashbackAyar = {
  aktif: false,
};

const MIGRATION_072 =
  "072_teklif_cashback.sql migration’ını çalıştırın.";

export function teklifCashbackMigrationMesaji(): string {
  return MIGRATION_072;
}

export async function teklifCashbackTablosuVar(): Promise<boolean> {
  if (!supabaseDbAktif()) return false;
  const { error } = await getSupabaseAdmin()
    .from("teklif_cashback_ayar")
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

function isoAl(v: unknown): string | undefined {
  if (v == null || v === "") return undefined;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

export function ayarFromRow(data: {
  aktif?: unknown;
  baslangic?: unknown;
  bitis?: unknown;
  guncelleme?: unknown;
}): TeklifCashbackAyar {
  return {
    aktif: Boolean(data.aktif),
    baslangic: isoAl(data.baslangic),
    bitis: isoAl(data.bitis),
    guncelleme: data.guncelleme ? String(data.guncelleme) : undefined,
  };
}

/** baslangic <= now < bitis ve aktif */
export function teklifCashbackAraliktaMi(
  ayar: Pick<TeklifCashbackAyar, "aktif" | "baslangic" | "bitis">,
  now: Date = new Date()
): boolean {
  if (!ayar.aktif) return false;
  if (!ayar.baslangic || !ayar.bitis) return false;
  const t = now.getTime();
  const bas = new Date(ayar.baslangic).getTime();
  const bit = new Date(ayar.bitis).getTime();
  if (Number.isNaN(bas) || Number.isNaN(bit)) return false;
  return bas <= t && t < bit;
}

export function teklifCashbackDurum(
  ayar: Pick<TeklifCashbackAyar, "aktif" | "baslangic" | "bitis">,
  now: Date = new Date()
): TeklifCashbackDurum {
  if (!ayar.aktif) return "kapali";
  if (teklifCashbackAraliktaMi(ayar, now)) return "aktif";
  return "sure_disi";
}

export async function getTeklifCashbackAyar(): Promise<TeklifCashbackAyar> {
  if (!(await teklifCashbackTablosuVar())) {
    return { ...TEKLIF_CASHBACK_VARSAYILAN };
  }
  const { data, error } = await getSupabaseAdmin()
    .from("teklif_cashback_ayar")
    .select("aktif, baslangic, bitis, guncelleme")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ...TEKLIF_CASHBACK_VARSAYILAN };
  return ayarFromRow(data);
}

export async function guncelleTeklifCashbackAyar(opts: {
  aktif?: boolean;
  baslangic?: string | null;
  bitis?: string | null;
}): Promise<TeklifCashbackAyar> {
  if (!(await teklifCashbackTablosuVar())) {
    throw new Error(MIGRATION_072);
  }
  const mevcut = await getTeklifCashbackAyar();
  const aktif = opts.aktif ?? mevcut.aktif;

  let baslangic =
    opts.baslangic === undefined
      ? mevcut.baslangic
      : opts.baslangic === null || opts.baslangic === ""
        ? undefined
        : isoAl(opts.baslangic);
  let bitis =
    opts.bitis === undefined
      ? mevcut.bitis
      : opts.bitis === null || opts.bitis === ""
        ? undefined
        : isoAl(opts.bitis);

  if (
    opts.baslangic !== undefined &&
    opts.baslangic !== null &&
    opts.baslangic !== "" &&
    !baslangic
  ) {
    throw new Error("Geçerli bir başlangıç tarihi girin.");
  }
  if (
    opts.bitis !== undefined &&
    opts.bitis !== null &&
    opts.bitis !== "" &&
    !bitis
  ) {
    throw new Error("Geçerli bir bitiş tarihi girin.");
  }

  if (aktif) {
    if (!baslangic || !bitis) {
      throw new Error(
        "Kampanya aktifken başlangıç ve bitiş tarihi zorunludur."
      );
    }
    if (new Date(bitis).getTime() <= new Date(baslangic).getTime()) {
      throw new Error("Bitiş, başlangıçtan sonra olmalıdır.");
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("teklif_cashback_ayar")
    .upsert({
      id: "default",
      aktif,
      baslangic: baslangic ?? null,
      bitis: bitis ?? null,
      guncelleme: now,
    })
    .select("aktif, baslangic, bitis, guncelleme")
    .single();
  if (error) throw error;
  return ayarFromRow(data);
}

export async function teklifCashbackKampanyaAktifMi(
  now: Date = new Date()
): Promise<boolean> {
  const ayar = await getTeklifCashbackAyar();
  return teklifCashbackAraliktaMi(ayar, now);
}
