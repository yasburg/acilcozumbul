import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";

export type PanelSmsSablon = {
  id: string;
  etiket: string;
  govde: string;
  aktif: boolean;
  sira: number;
  olusturulma: string;
  guncelleme: string;
};

export type PanelSmsSablonOzet = {
  id: string;
  etiket: string;
  govde: string;
};

let tabloVar: boolean | null = null;

export async function panelSmsSablonTablosuVar(): Promise<boolean> {
  if (tabloVar !== null) return tabloVar;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_sms_sablonlar")
    .select("id")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

export const MIGRATION_031_MESAJ =
  "SMS şablonları için Supabase’de supabase/migrations/031_panel_sms_sablonlar.sql dosyasını SQL Editor’da çalıştırın.";

function satirMap(r: Record<string, unknown>): PanelSmsSablon {
  return {
    id: String(r.id),
    etiket: String(r.etiket ?? ""),
    govde: String(r.govde ?? ""),
    aktif: Boolean(r.aktif),
    sira: Number(r.sira) || 0,
    olusturulma: String(r.olusturulma ?? ""),
    guncelleme: String(r.guncelleme ?? ""),
  };
}

/** Toplu SMS dropdown: aktif şablonlar; tablo yoksa boş */
export async function listeAktifSmsSablonOzetleri(): Promise<PanelSmsSablonOzet[]> {
  if (!(await panelSmsSablonTablosuVar())) {
    return [];
  }
  const { data, error } = await getSupabaseAdmin()
    .from("panel_sms_sablonlar")
    .select("id, etiket, govde, sira, olusturulma")
    .eq("aktif", true)
    .order("sira", { ascending: true })
    .order("olusturulma", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: String(r.id),
    etiket: String(r.etiket ?? ""),
    govde: String(r.govde ?? ""),
  }));
}

export async function listeTumSmsSablonlari(): Promise<PanelSmsSablon[]> {
  if (!(await panelSmsSablonTablosuVar())) {
    throw new Error(MIGRATION_031_MESAJ);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("panel_sms_sablonlar")
    .select("id, etiket, govde, aktif, sira, olusturulma, guncelleme")
    .order("sira", { ascending: true })
    .order("olusturulma", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => satirMap(r as Record<string, unknown>));
}

export function smsSablonAlanDogrula(opts: {
  etiket?: unknown;
  govde?: unknown;
  sira?: unknown;
}): { etiket: string; govde: string; sira: number } | { error: string } {
  const etiket =
    typeof opts.etiket === "string" ? opts.etiket.trim() : "";
  const govde = typeof opts.govde === "string" ? opts.govde.trim() : "";
  const siraHam = opts.sira;
  const sira =
    typeof siraHam === "number"
      ? Math.floor(siraHam)
      : typeof siraHam === "string" && siraHam.trim()
        ? Number.parseInt(siraHam, 10)
        : 0;

  if (!etiket) return { error: "Etiket gerekli." };
  if (etiket.length > 120) return { error: "Etiket en fazla 120 karakter." };
  if (!govde) return { error: "Gövde metni gerekli." };
  if (govde.length > 2000) return { error: "Gövde en fazla 2000 karakter." };
  if (!Number.isFinite(sira) || sira < 0 || sira > 9999) {
    return { error: "Sıra 0–9999 arası olmalı." };
  }
  return { etiket, govde, sira };
}

export async function olusturSmsSablon(opts: {
  etiket: string;
  govde: string;
  sira?: number;
  aktif?: boolean;
}): Promise<PanelSmsSablon> {
  if (!(await panelSmsSablonTablosuVar())) {
    throw new Error(MIGRATION_031_MESAJ);
  }
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("panel_sms_sablonlar")
    .insert({
      etiket: opts.etiket,
      govde: opts.govde,
      sira: opts.sira ?? 0,
      aktif: opts.aktif !== false,
      olusturulma: now,
      guncelleme: now,
    })
    .select("id, etiket, govde, aktif, sira, olusturulma, guncelleme")
    .single();
  if (error || !data) throw error ?? new Error("Şablon oluşturulamadı.");
  return satirMap(data as Record<string, unknown>);
}

export async function guncelleSmsSablon(
  id: string,
  patch: {
    etiket?: string;
    govde?: string;
    sira?: number;
    aktif?: boolean;
  }
): Promise<PanelSmsSablon> {
  if (!(await panelSmsSablonTablosuVar())) {
    throw new Error(MIGRATION_031_MESAJ);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("panel_sms_sablonlar")
    .update({
      ...patch,
      guncelleme: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, etiket, govde, aktif, sira, olusturulma, guncelleme")
    .single();
  if (error || !data) throw error ?? new Error("Şablon güncellenemedi.");
  return satirMap(data as Record<string, unknown>);
}

export async function silSmsSablon(id: string): Promise<void> {
  if (!(await panelSmsSablonTablosuVar())) {
    throw new Error(MIGRATION_031_MESAJ);
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_sms_sablonlar")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
