import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  KULLANIMA_ACIK_ILLER,
  sehirKullanimAcikMi,
} from "./cekici-sehir-acilis";
import { DESTEKLENEN_ILLER, ilGecerliMi } from "./il-ilce";
import { talepKonumBolge } from "./cekici-bolge";
import type { Talep } from "./types";

let tabloVar: boolean | null = null;
let cache: { iller: string[]; at: number } | null = null;
const CACHE_MS = 15_000;

export function sehirAcilisCacheTemizle(): void {
  cache = null;
}

export async function sehirAcilisTablosuVar(): Promise<boolean> {
  if (tabloVar === true) return true;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("sehir_acilis")
    .select("il")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

/** Kullanıma açık iller (DB; yoksa kod fallback) */
export async function getAcikIller(): Promise<string[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return [...cache.iller];
  }

  if (!(await sehirAcilisTablosuVar())) {
    const fallback = [...KULLANIMA_ACIK_ILLER];
    cache = { iller: fallback, at: Date.now() };
    return fallback;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("sehir_acilis")
    .select("il")
    .eq("acik", true);

  if (error) {
    console.error("[sehir-acilis] getAcikIller", error.message);
    const fallback = [...KULLANIMA_ACIK_ILLER];
    cache = { iller: fallback, at: Date.now() };
    return fallback;
  }

  const iller = (data ?? [])
    .map((r: any) => String(r.il))
    .filter((il: string) => ilGecerliMi(il));

  const sonuc = iller.length > 0 ? iller : [...KULLANIMA_ACIK_ILLER];
  cache = { iller: sonuc, at: Date.now() };
  return [...sonuc];
}

export async function sehirKullanimAcikMiDb(
  sehir: string | undefined | null
): Promise<boolean> {
  return sehirKullanimAcikMi(sehir, await getAcikIller());
}

/** Talep konumu kullanıma açık mı? (SMS / bildirim kapısı) */
export async function talepSehriAcikMi(talep: Talep): Promise<boolean> {
  const { il } = talepKonumBolge(talep);
  return sehirKullanimAcikMiDb(il);
}

export type SehirAcilisSatir = {
  il: string;
  acik: boolean;
};

/** Panel: 81 il + DB durumu */
export async function listeleSehirAcilis(): Promise<SehirAcilisSatir[]> {
  const acikSet = new Set(await getAcikIller());
  return DESTEKLENEN_ILLER.map((il) => ({
    il,
    acik: acikSet.has(il),
  }));
}

export async function sehirAcilisAyarla(
  il: string,
  acik: boolean
): Promise<SehirAcilisSatir> {
  const temiz = il.trim();
  if (!ilGecerliMi(temiz)) {
    throw new Error("Geçersiz il.");
  }
  if (!(await sehirAcilisTablosuVar())) {
    throw new Error(
      "sehir_acilis tablosu yok. supabase/migrations/038_sehir_acilis.sql çalıştırın."
    );
  }

  const { error } = await getSupabaseAdmin().from("sehir_acilis").upsert(
    {
      il: temiz,
      acik,
      guncelleme: new Date().toISOString(),
    },
    { onConflict: "il" }
  );
  if (error) throw new Error(error.message);

  sehirAcilisCacheTemizle();
  return { il: temiz, acik };
}

/** Panel: tüm desteklenen illeri aç veya kapat */
export async function sehirAcilisTopluAyarla(
  acik: boolean
): Promise<{ sayi: number; acik: boolean }> {
  if (!(await sehirAcilisTablosuVar())) {
    throw new Error(
      "sehir_acilis tablosu yok. supabase/migrations/038_sehir_acilis.sql çalıştırın."
    );
  }

  const guncelleme = new Date().toISOString();
  const rows = DESTEKLENEN_ILLER.map((il) => ({
    il,
    acik,
    guncelleme,
  }));

  const { error } = await getSupabaseAdmin()
    .from("sehir_acilis")
    .upsert(rows, { onConflict: "il" });
  if (error) throw new Error(error.message);

  sehirAcilisCacheTemizle();
  return { sayi: rows.length, acik };
}
