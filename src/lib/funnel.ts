import { getSupabaseAdmin } from "./supabase/admin";
import type { Talep } from "./types";

export type FunnelOlay =
  | "form_basla"
  | "otp_gonder"
  | "otp_dogrulandi"
  | "talep_olustur";

export type FunnelOzet = {
  gun: number;
  formBasla: number;
  otpGonder: number;
  otpDogrulandi: number;
  talepOlustur: number;
  teklifVar: number;
  kazanan: number;
};

export async function funnelOlayKaydet(input: {
  olay: FunnelOlay;
  telefon?: string | null;
  ipHash?: string | null;
  talepId?: string | null;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("funnel_events").insert({
    olay: input.olay,
    telefon: input.telefon ?? null,
    ip_hash: input.ipHash ?? null,
    talep_id: input.talepId ?? null,
  });
  if (error && error.code !== "42P01") {
    console.error("[funnel_events]", error.message);
  }
}

async function funnelOlaySay(olay: FunnelOlay, gun: number): Promise<number> {
  const sb = getSupabaseAdmin();
  const since = new Date(Date.now() - gun * 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await sb
    .from("funnel_events")
    .select("*", { count: "exact", head: true })
    .eq("olay", olay)
    .gte("olusturulma", since);
  if (error) {
    if (error.code === "42P01") return 0;
    throw error;
  }
  return count ?? 0;
}

function talepTeklifVar(t: Talep): boolean {
  return (t.teklifler?.length ?? 0) > 0;
}

export async function funnelOzetHesapla(
  talepler: Talep[],
  gun = 30
): Promise<FunnelOzet> {
  const since = Date.now() - gun * 24 * 60 * 60 * 1000;
  const sonTalepler = talepler.filter(
    (t) => new Date(t.olusturulma).getTime() >= since
  );

  const [formBasla, otpGonder, otpDogrulandi, talepOlustur] = await Promise.all([
    funnelOlaySay("form_basla", gun),
    funnelOlaySay("otp_gonder", gun),
    funnelOlaySay("otp_dogrulandi", gun),
    funnelOlaySay("talep_olustur", gun),
  ]);

  const talepSayDb = sonTalepler.length;
  const talepOlusturFinal = Math.max(talepOlustur, talepSayDb);

  return {
    gun,
    formBasla,
    otpGonder,
    otpDogrulandi,
    talepOlustur: talepOlusturFinal,
    teklifVar: sonTalepler.filter(talepTeklifVar).length,
    kazanan: sonTalepler.filter((t) => Boolean(t.kazananCekiciId)).length,
  };
}
