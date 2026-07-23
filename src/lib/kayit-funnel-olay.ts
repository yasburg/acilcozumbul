import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { kayitFunnelMi, type KayitFunnelId } from "./kayit-funnel";

export const KAYIT_FUNNEL_OLAYLAR = [
  "goruldu",
  "telefon_focus",
  "otp_gonder",
  "otp_ok",
  "hesap",
  "kurulum_1",
  "kurulum_2",
  "kurulum_3",
  "panel_hazir",
] as const;

export type KayitFunnelOlayTip = (typeof KAYIT_FUNNEL_OLAYLAR)[number];

export function kayitFunnelOlayMi(v: string): v is KayitFunnelOlayTip {
  return (KAYIT_FUNNEL_OLAYLAR as readonly string[]).includes(v);
}

export async function kaydetKayitFunnelOlay(opts: {
  funnel: string;
  olay: string;
  sessionId?: string | null;
  cekiciId?: string | null;
}): Promise<void> {
  if (!supabaseDbAktif()) return;
  if (!kayitFunnelMi(opts.funnel) || !kayitFunnelOlayMi(opts.olay)) return;
  const { error } = await getSupabaseAdmin().from("kayit_funnel_olay").insert({
    funnel: opts.funnel,
    olay: opts.olay,
    session_id: opts.sessionId?.slice(0, 80) ?? null,
    cekici_id: opts.cekiciId ?? null,
  });
  if (error) {
    console.error("[kayit-funnel] olay", error.message);
  }
}

export type KayitFunnelOzet = {
  funnel: KayitFunnelId;
  etiket: string;
  yol: string;
  goruldu: number;
  otpGonder: number;
  hesap: number;
  panelHazir: number;
  otpOran: number | null;
  hesapOran: number | null;
  hazirOran: number | null;
};

export function kayitFunnelOzetHesapla(
  rows: { funnel: string; olay: string }[],
  tanimlar: { id: KayitFunnelId; etiket: string; yol: string }[]
): KayitFunnelOzet[] {
  const say = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const f = String(r.funnel ?? "");
    const o = String(r.olay ?? "");
    if (!say.has(f)) say.set(f, new Map());
    const m = say.get(f)!;
    m.set(o, (m.get(o) ?? 0) + 1);
  }

  return tanimlar.map((t) => {
    const m = say.get(t.id) ?? new Map();
    const goruldu = m.get("goruldu") ?? 0;
    const otpGonder = m.get("otp_gonder") ?? 0;
    const hesap = m.get("hesap") ?? 0;
    const panelHazir = m.get("panel_hazir") ?? 0;
    return {
      funnel: t.id,
      etiket: t.etiket,
      yol: t.yol,
      goruldu,
      otpGonder,
      hesap,
      panelHazir,
      otpOran: goruldu > 0 ? otpGonder / goruldu : null,
      hesapOran: goruldu > 0 ? hesap / goruldu : null,
      hazirOran: hesap > 0 ? panelHazir / hesap : null,
    };
  });
}
