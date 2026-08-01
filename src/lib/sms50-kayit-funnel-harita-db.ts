import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  KAYIT_FUNNEL_VARSAYILAN,
  kayitFunnelMi,
  type KayitFunnelId,
} from "./kayit-funnel";
import {
  SMS50_KAYIT_FUNNEL_HARITASI,
  SMS50_VARYANTLAR,
  sms50VaryantMi,
  type Sms50Varyant,
} from "./sms50-kampanya";

export type Sms50KayitFunnelHarita = Record<Sms50Varyant, KayitFunnelId>;

let tabloVar: boolean | null = null;
let cache: { harita: Sms50KayitFunnelHarita; at: number } | null = null;
const CACHE_MS = 15_000;

export function sms50KayitFunnelHaritaCacheTemizle(): void {
  cache = null;
}

/** Kod içi seed / DB yoksa fallback */
export function sms50KayitFunnelHaritaKodVarsayilan(): Sms50KayitFunnelHarita {
  const out = {} as Sms50KayitFunnelHarita;
  for (const v of SMS50_VARYANTLAR) {
    out[v] = SMS50_KAYIT_FUNNEL_HARITASI[v] ?? KAYIT_FUNNEL_VARSAYILAN;
  }
  return out;
}

export async function sms50KayitFunnelHaritaTablosuVar(): Promise<boolean> {
  if (tabloVar === true) return true;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("sms50_kayit_funnel_harita")
    .select("varyant")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

export async function getSms50KayitFunnelHaritasi(): Promise<Sms50KayitFunnelHarita> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return { ...cache.harita };
  }

  const fallback = sms50KayitFunnelHaritaKodVarsayilan();
  if (!(await sms50KayitFunnelHaritaTablosuVar())) {
    cache = { harita: fallback, at: Date.now() };
    return { ...fallback };
  }

  const { data, error } = await getSupabaseAdmin()
    .from("sms50_kayit_funnel_harita")
    .select("varyant, kayit_funnel");

  if (error) {
    console.error("[sms50-harita] get", error.message);
    cache = { harita: fallback, at: Date.now() };
    return { ...fallback };
  }

  const harita = { ...fallback };
  for (const row of data ?? []) {
    const v = String(row.varyant ?? "");
    const f = String(row.kayit_funnel ?? "");
    if (sms50VaryantMi(v) && kayitFunnelMi(f)) {
      harita[v] = f;
    }
  }
  cache = { harita, at: Date.now() };
  return { ...harita };
}

export async function sms50KayitFunnelHaritaAyarla(
  varyant: string,
  kayitFunnel: string
): Promise<{ varyant: Sms50Varyant; kayitFunnel: KayitFunnelId }> {
  if (!sms50VaryantMi(varyant)) {
    throw new Error("Geçersiz varyant.");
  }
  if (!kayitFunnelMi(kayitFunnel)) {
    throw new Error("Geçersiz kayıt funnel.");
  }
  if (!(await sms50KayitFunnelHaritaTablosuVar())) {
    throw new Error(
      "sms50_kayit_funnel_harita tablosu yok. 043_sms50_kayit_funnel_harita.sql çalıştırın."
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("sms50_kayit_funnel_harita")
    .upsert(
      {
        varyant,
        kayit_funnel: kayitFunnel,
        guncelleme: new Date().toISOString(),
      },
      { onConflict: "varyant" }
    );

  if (error) {
    throw new Error(error.message);
  }

  sms50KayitFunnelHaritaCacheTemizle();
  return { varyant, kayitFunnel };
}
