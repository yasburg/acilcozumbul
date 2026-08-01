import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { kayitFunnelMi, type KayitFunnelId } from "./kayit-funnel";

/** Sabit dönüşüm / kurulum olayları */
export const KAYIT_FUNNEL_OLAY_SABIT = [
  "goruldu",
  "cta_kayit_basla",
  "telefon_focus",
  "otp_gonder",
  "otp_ok",
  "otp_hata",
  "hesap",
  "hesap_hata",
  "zaten_kayitli",
  "btn_otp_gonder",
  "btn_otp_yeniden",
  "btn_kayit_submit",
  "yasal_onay_tik",
  "kurulum_1",
  "kurulum_2",
  "kurulum_3",
  "panel_hazir",
] as const;

/** Alan adları (field_focus_* / field_filled_*) */
export const KAYIT_FUNNEL_ALANLAR = [
  "ad",
  "soyad",
  "dogum_tarihi",
  "telefon",
  "sehir",
  "sifre",
  "sifre_tekrar",
  "otp",
  "davet_kodu",
] as const;

export type KayitFunnelAlan = (typeof KAYIT_FUNNEL_ALANLAR)[number];

export type KayitFunnelOlayTip =
  | (typeof KAYIT_FUNNEL_OLAY_SABIT)[number]
  | `field_focus_${KayitFunnelAlan}`
  | `field_filled_${KayitFunnelAlan}`;

/** Geriye uyum — eski import’lar */
export const KAYIT_FUNNEL_OLAYLAR = KAYIT_FUNNEL_OLAY_SABIT;

const SABIT_SET = new Set<string>(KAYIT_FUNNEL_OLAY_SABIT);
const ALAN_SET = new Set<string>(KAYIT_FUNNEL_ALANLAR);

export function kayitFunnelAlanMi(v: string): v is KayitFunnelAlan {
  return ALAN_SET.has(v);
}

export function kayitFunnelOlayMi(v: string): v is KayitFunnelOlayTip {
  if (SABIT_SET.has(v)) return true;
  const focus = /^field_focus_([a-z_]+)$/.exec(v);
  if (focus && kayitFunnelAlanMi(focus[1]!)) return true;
  const filled = /^field_filled_([a-z_]+)$/.exec(v);
  if (filled && kayitFunnelAlanMi(filled[1]!)) return true;
  return false;
}

/** Client’tan yazılamaz — sunucu only */
export function kayitFunnelOlaySunucuOnlyMi(olay: string): boolean {
  return (
    olay === "hesap" ||
    olay === "otp_ok" ||
    olay === "hesap_hata" ||
    olay.startsWith("kurulum_") ||
    olay === "panel_hazir"
  );
}

export type KayitFunnelOlayMeta = Record<string, string | number | boolean>;

export async function kaydetKayitFunnelOlay(opts: {
  funnel: string;
  olay: string;
  sessionId?: string | null;
  cekiciId?: string | null;
  meta?: KayitFunnelOlayMeta | null;
}): Promise<void> {
  if (!supabaseDbAktif()) return;
  if (!kayitFunnelMi(opts.funnel) || !kayitFunnelOlayMi(opts.olay)) return;
  const row: Record<string, unknown> = {
    funnel: opts.funnel,
    olay: opts.olay,
    session_id: opts.sessionId?.slice(0, 80) ?? null,
    cekici_id: opts.cekiciId ?? null,
  };
  if (opts.meta && Object.keys(opts.meta).length > 0) {
    row.meta = opts.meta;
  }
  const { error } = await getSupabaseAdmin()
    .from("kayit_funnel_olay")
    .insert(row);
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

/** Ortak huni adımları (session en az bir eşleşen olay) */
export const KAYIT_FUNNEL_HUNI_ADIMLARI = [
  { id: "goruldu", label: "Görülme", olaylar: ["goruldu"] },
  {
    id: "form_etkilesim",
    label: "Form etkileşim",
    olaylar: [] as string[], // field_filled_* dinamik
  },
  { id: "otp_gonder", label: "OTP gönder", olaylar: ["otp_gonder"] },
  { id: "otp_ok", label: "OTP doğrula", olaylar: ["otp_ok"] },
  { id: "hesap", label: "Hesap", olaylar: ["hesap"] },
  { id: "panel_hazir", label: "Kurulum hazır", olaylar: ["panel_hazir"] },
] as const;

export type KayitFunnelHuniAdim = {
  adim: string;
  label: string;
  sessionSayisi: number;
  oncekiOran: number | null;
};

export type KayitFunnelOlaySatir = {
  funnel: string;
  olay: string;
  session_id?: string | null;
  olusturulma?: string;
};

function sessionOlayEslesir(
  olaylar: Set<string>,
  adimOlaylari: readonly string[],
  formEtkilesim: boolean
): boolean {
  if (formEtkilesim) {
    for (const o of olaylar) {
      if (o.startsWith("field_filled_")) return true;
    }
    return false;
  }
  return adimOlaylari.some((o) => olaylar.has(o));
}

/** Unique session_id ile huni (session_id null olanlar sayılmaz) */
export function kayitFunnelSessionHuniHesapla(
  rows: KayitFunnelOlaySatir[]
): KayitFunnelHuniAdim[] {
  const bySession = new Map<string, Set<string>>();
  for (const r of rows) {
    const sid = r.session_id?.trim();
    if (!sid) continue;
    if (!bySession.has(sid)) bySession.set(sid, new Set());
    bySession.get(sid)!.add(String(r.olay));
  }

  const adimlar = KAYIT_FUNNEL_HUNI_ADIMLARI.map((a) => {
    let n = 0;
    const form = a.id === "form_etkilesim";
    for (const olaylar of bySession.values()) {
      if (sessionOlayEslesir(olaylar, a.olaylar, form)) n += 1;
    }
    return { adim: a.id, label: a.label, sessionSayisi: n };
  });

  return adimlar.map((a, i) => {
    const onceki = i === 0 ? null : adimlar[i - 1]!.sessionSayisi;
    return {
      ...a,
      oncekiOran:
        onceki != null && onceki > 0 ? a.sessionSayisi / onceki : null,
    };
  });
}

export type KayitFunnelGunluk = {
  gun: string;
  goruldu: number;
  hesap: number;
};

export function kayitFunnelGunlukHesapla(
  rows: KayitFunnelOlaySatir[]
): KayitFunnelGunluk[] {
  const map = new Map<string, { goruldu: number; hesap: number }>();
  for (const r of rows) {
    const t = r.olusturulma ? new Date(r.olusturulma) : null;
    if (!t || Number.isNaN(t.getTime())) continue;
    const gun = t.toISOString().slice(0, 10);
    if (!map.has(gun)) map.set(gun, { goruldu: 0, hesap: 0 });
    const m = map.get(gun)!;
    if (r.olay === "goruldu") m.goruldu += 1;
    if (r.olay === "hesap") m.hesap += 1;
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([gun, v]) => ({ gun, ...v }));
}

export type KayitFunnelOlayHacmi = {
  olay: string;
  sayi: number;
  byFunnel: Record<string, number>;
};

export function kayitFunnelOlayHacmiHesapla(
  rows: KayitFunnelOlaySatir[]
): KayitFunnelOlayHacmi[] {
  const map = new Map<string, { sayi: number; byFunnel: Record<string, number> }>();
  for (const r of rows) {
    const o = String(r.olay);
    const f = String(r.funnel);
    if (!map.has(o)) map.set(o, { sayi: 0, byFunnel: {} });
    const m = map.get(o)!;
    m.sayi += 1;
    m.byFunnel[f] = (m.byFunnel[f] ?? 0) + 1;
  }
  return [...map.entries()]
    .map(([olay, v]) => ({ olay, sayi: v.sayi, byFunnel: v.byFunnel }))
    .sort((a, b) => b.sayi - a.sayi);
}

export function kayitFunnelBenzersizSession(
  rows: KayitFunnelOlaySatir[]
): number {
  const s = new Set<string>();
  for (const r of rows) {
    const sid = r.session_id?.trim();
    if (sid) s.add(sid);
  }
  return s.size;
}
