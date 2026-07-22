import { createHash } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  SMS50_KAMPANYA_KODU,
  SMS50_VARYANTLAR,
  type Sms50Varyant,
  sms50KisaUrl,
} from "./sms50-kampanya";

let tiklamaTabloVar: boolean | null = null;

export async function smsKampanyaTiklamaTablosuVar(): Promise<boolean> {
  if (tiklamaTabloVar !== null) return tiklamaTabloVar;
  if (!supabaseDbAktif()) {
    tiklamaTabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_tiklama")
    .select("id")
    .limit(1);
  tiklamaTabloVar = !error;
  return tiklamaTabloVar;
}

export async function kaydetSmsKampanyaTiklama(opts: {
  varyant: Sms50Varyant;
  kampanyaKodu?: string;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<void> {
  if (!(await smsKampanyaTiklamaTablosuVar())) return;
  const ipHash = opts.ip
    ? createHash("sha256").update(opts.ip).digest("hex").slice(0, 16)
    : null;
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_tiklama")
    .insert({
      varyant: opts.varyant,
      kampanya_kodu: opts.kampanyaKodu ?? SMS50_KAMPANYA_KODU,
      user_agent: opts.userAgent?.slice(0, 500) ?? null,
      ip_hash: ipHash,
    });
  if (error) {
    console.error("[sms50] tıklama kaydı", error.message);
  }
}

export type Sms50VaryantOzet = {
  varyant: Sms50Varyant;
  kisaUrl: string;
  gonderilen: number;
  tiklama: number;
  ctr: number | null;
  sonTiklama: string | null;
};

export async function getSms50VaryantOzetleri(
  kampanyaKodu = SMS50_KAMPANYA_KODU
): Promise<Sms50VaryantOzet[]> {
  const sb = getSupabaseAdmin();

  const [tiklamaRes, gonderimRes] = await Promise.all([
    sb
      .from("sms_kampanya_tiklama")
      .select("varyant, olusturulma")
      .eq("kampanya_kodu", kampanyaKodu),
    sb
      .from("panel_toplu_sms_listeler")
      .select("varyant, basarili, olusturulma")
      .eq("kampanya_kodu", kampanyaKodu),
  ]);

  if (tiklamaRes.error) throw tiklamaRes.error;
  /* kampanya_kodu kolonu yoksa gönderim özeti boş kalsın */
  const gonderimRows = gonderimRes.error ? [] : (gonderimRes.data ?? []);
  const tiklamaRows = tiklamaRes.data ?? [];

  const tiklamaSay = new Map<string, number>();
  const sonTiklama = new Map<string, string>();
  for (const row of tiklamaRows) {
    const v = String(row.varyant ?? "");
    tiklamaSay.set(v, (tiklamaSay.get(v) ?? 0) + 1);
    const t = String(row.olusturulma ?? "");
    const onceki = sonTiklama.get(v);
    if (!onceki || t > onceki) sonTiklama.set(v, t);
  }

  const gonderilen = new Map<string, number>();
  for (const row of gonderimRows) {
    const v = String(row.varyant ?? "");
    if (!v) continue;
    gonderilen.set(v, (gonderilen.get(v) ?? 0) + (Number(row.basarili) || 0));
  }

  return SMS50_VARYANTLAR.map((varyant) => {
    const g = gonderilen.get(varyant) ?? 0;
    const t = tiklamaSay.get(varyant) ?? 0;
    return {
      varyant,
      kisaUrl: sms50KisaUrl(varyant),
      gonderilen: g,
      tiklama: t,
      ctr: g > 0 ? t / g : null,
      sonTiklama: sonTiklama.get(varyant) ?? null,
    };
  });
}
