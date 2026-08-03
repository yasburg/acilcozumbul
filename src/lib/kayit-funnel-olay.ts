import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  kayitFunnelMi,
  type KayitFunnelId,
  type KayitFunnelTip,
} from "./kayit-funnel";

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
  "form_adim_1",
  "form_adim_2",
  "form_adim_3",
  "wheel_icon_viewed",
  "wheel_icon_clicked",
  "wheel_auto_opened",
  "wheel_modal_closed",
  "wheel_spin_started",
  "wheel_spin_retry_result",
  "wheel_spin_reward_result",
  "wheel_reward_10",
  "wheel_reward_20",
  "wheel_reward_50",
  "wheel_reward_100",
  "wheel_reward_200",
  "wheel_reward_claim_clicked",
  "wheel_reward_claimed",
  "wheel_reward_claim_failed",
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

/** Ortak huni adımları — tüm tiplerde aynı olay adları */
export const KAYIT_FUNNEL_HUNI_ORTAK_BAS = [
  { id: "goruldu", label: "Görülme", olaylar: ["goruldu"] },
  {
    id: "form_etkilesim",
    label: "İlk etkileşim",
    olaylar: [] as string[], // özel: field_* / form_adim_* / cta / telefon
  },
] as const;

export const KAYIT_FUNNEL_HUNI_ORTAK_SON = [
  { id: "otp_gonder", label: "OTP gönder", olaylar: ["otp_gonder"] },
  { id: "otp_ok", label: "OTP doğrula", olaylar: ["otp_ok"] },
  { id: "hesap", label: "Hesap", olaylar: ["hesap"] },
  { id: "panel_hazir", label: "Kurulum hazır", olaylar: ["panel_hazir"] },
] as const;

/** Tip’e özel orta adımlar (ortak olay isimleriyle) */
const KAYIT_FUNNEL_HUNI_ORTA: Record<
  KayitFunnelTip,
  readonly { id: string; label: string; olaylar: readonly string[] }[]
> = {
  /** A — uzun form: CTA + telefon alanı */
  kontrol: [
    {
      id: "cta_kayit_basla",
      label: "Kayıt başla",
      olaylar: ["cta_kayit_basla"],
    },
    {
      id: "telefon",
      label: "Telefon",
      olaylar: ["field_filled_telefon", "field_focus_telefon"],
    },
  ],
  /** B/D/E — phone-first: telefon odağı */
  phone_first: [
    {
      id: "telefon_focus",
      label: "Telefon",
      olaylar: ["telefon_focus"],
    },
  ],
  /** C — seçim wizard: hizmet → bölge → telefon */
  secim_wizard: [
    {
      id: "form_adim_1",
      label: "Adım 1 · Hizmet",
      olaylar: ["form_adim_1"],
    },
    {
      id: "form_adim_2",
      label: "Adım 2 · Şehir/bölge",
      olaylar: ["form_adim_2"],
    },
    {
      id: "form_adim_3",
      label: "Adım 3 · Telefon",
      olaylar: ["form_adim_3"],
    },
  ],
};

export type KayitFunnelHuniAdimTanim = {
  id: string;
  label: string;
  olaylar: readonly string[];
};

/** Tip’e göre huni adımları (A/B/C kendi bazında; ortak adımlar aynı olay) */
export function kayitFunnelHuniAdimlari(
  tip: KayitFunnelTip | "ortak" = "ortak"
): KayitFunnelHuniAdimTanim[] {
  if (tip === "ortak") {
    return [...KAYIT_FUNNEL_HUNI_ORTAK_BAS, ...KAYIT_FUNNEL_HUNI_ORTAK_SON];
  }
  return [
    ...KAYIT_FUNNEL_HUNI_ORTAK_BAS,
    ...KAYIT_FUNNEL_HUNI_ORTA[tip],
    ...KAYIT_FUNNEL_HUNI_ORTAK_SON,
  ];
}

/**
 * @deprecated Tip bilmeden çağırma — `kayitFunnelHuniAdimlari(tip)` kullan.
 * Geriye uyum: wizard adımlı tam liste (yanlışlıkla B’de 0 gösterir).
 */
export const KAYIT_FUNNEL_HUNI_ADIMLARI = kayitFunnelHuniAdimlari("secim_wizard");

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
  ilkEtkilesim: boolean
): boolean {
  if (ilkEtkilesim) {
    for (const o of olaylar) {
      if (o.startsWith("field_filled_")) return true;
      if (o.startsWith("field_focus_")) return true;
      if (o.startsWith("form_adim_")) return true;
      if (o === "telefon_focus") return true;
      if (o === "cta_kayit_basla") return true;
      if (o === "yasal_onay_tik") return true;
      if (o === "wheel_icon_clicked") return true;
      if (o === "wheel_spin_started") return true;
    }
    return false;
  }
  return adimOlaylari.some((o) => olaylar.has(o));
}

/** Unique session_id ile huni (session_id null olanlar sayılmaz) */
export function kayitFunnelSessionHuniHesapla(
  rows: KayitFunnelOlaySatir[],
  tip: KayitFunnelTip | "ortak" = "ortak"
): KayitFunnelHuniAdim[] {
  const bySession = new Map<string, Set<string>>();
  for (const r of rows) {
    const sid = r.session_id?.trim();
    if (!sid) continue;
    if (!bySession.has(sid)) bySession.set(sid, new Set());
    bySession.get(sid)!.add(String(r.olay));
  }

  const huniAdimlari = kayitFunnelHuniAdimlari(tip);
  const adimlar = huniAdimlari.map((a) => {
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

/** Europe/Istanbul günü (YYYY-MM-DD) */
export function kayitFunnelGunTr(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function gunSonraki(gun: string): string {
  const d = new Date(`${gun}T12:00:00+03:00`);
  d.setDate(d.getDate() + 1);
  return kayitFunnelGunTr(d.toISOString());
}

export function kayitFunnelGunlukHesapla(
  rows: KayitFunnelOlaySatir[],
  aralik?: { from: string; to: string }
): KayitFunnelGunluk[] {
  const map = new Map<string, { goruldu: number; hesap: number }>();
  for (const r of rows) {
    if (!r.olusturulma) continue;
    const t = new Date(r.olusturulma);
    if (Number.isNaN(t.getTime())) continue;
    const gun = kayitFunnelGunTr(r.olusturulma);
    if (!map.has(gun)) map.set(gun, { goruldu: 0, hesap: 0 });
    const m = map.get(gun)!;
    if (r.olay === "goruldu") m.goruldu += 1;
    if (r.olay === "hesap") m.hesap += 1;
  }

  if (aralik?.from && aralik?.to) {
    const out: KayitFunnelGunluk[] = [];
    let gun = aralik.from;
    let guvenlik = 0;
    while (gun <= aralik.to && guvenlik < 400) {
      const v = map.get(gun) ?? { goruldu: 0, hesap: 0 };
      out.push({ gun, ...v });
      gun = gunSonraki(gun);
      guvenlik += 1;
    }
    return out;
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
