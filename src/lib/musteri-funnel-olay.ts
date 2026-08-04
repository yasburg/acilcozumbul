import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  musteriFunnelMi,
  type MusteriFunnelId,
} from "./musteri-funnel";

export const MUSTERI_FUNNEL_OLAY_SABIT = [
  "goruldu",
  "form_adim_sorun",
  "form_adim_bilgi",
  "form_adim_konum",
  "form_adim_detay",
  "form_adim_hedef",
  "service_selected",
  "otp_gonder",
  "otp_dogrulandi",
  "otp_hata",
  "talep_olustur",
] as const;

export type MusteriFunnelOlayTip = (typeof MUSTERI_FUNNEL_OLAY_SABIT)[number];

const OLAY_SET = new Set<string>(MUSTERI_FUNNEL_OLAY_SABIT);

export function musteriFunnelOlayMi(v: string): v is MusteriFunnelOlayTip {
  return OLAY_SET.has(v);
}

export type MusteriFunnelOlayMeta = Record<string, string | number | boolean>;

export async function kaydetMusteriFunnelOlay(opts: {
  funnel: string;
  olay: string;
  sessionId?: string | null;
  telefon?: string | null;
  talepId?: string | null;
  meta?: MusteriFunnelOlayMeta | null;
}): Promise<void> {
  if (!supabaseDbAktif()) return;
  if (!musteriFunnelMi(opts.funnel) || !musteriFunnelOlayMi(opts.olay)) return;
  const row: Record<string, unknown> = {
    funnel: opts.funnel,
    olay: opts.olay,
    session_id: opts.sessionId?.slice(0, 80) ?? null,
    telefon: opts.telefon?.slice(0, 32) ?? null,
    talep_id: opts.talepId?.slice(0, 80) ?? null,
  };
  if (opts.meta && Object.keys(opts.meta).length > 0) {
    row.meta = opts.meta;
  }
  const { error } = await getSupabaseAdmin()
    .from("musteri_funnel_olay")
    .insert(row);
  if (error) {
    console.error("[musteri-funnel] olay", error.message);
  }
}

export type MusteriFunnelOzet = {
  funnel: MusteriFunnelId;
  etiket: string;
  yol: string;
  goruldu: number;
  otpGonder: number;
  talep: number;
  otpOran: number | null;
  talepOran: number | null;
};

export function musteriFunnelOzetHesapla(
  rows: { funnel: string; olay: string }[],
  tanimlar: { id: MusteriFunnelId; etiket: string; yol: string }[]
): MusteriFunnelOzet[] {
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
    const talep = m.get("talep_olustur") ?? 0;
    return {
      funnel: t.id,
      etiket: t.etiket,
      yol: t.yol,
      goruldu,
      otpGonder,
      talep,
      otpOran: goruldu > 0 ? otpGonder / goruldu : null,
      talepOran: goruldu > 0 ? talep / goruldu : null,
    };
  });
}

/** Ortak huni — A/B karşılaştırılabilir adımlar */
export const MUSTERI_FUNNEL_HUNI_ADIMLARI = [
  { id: "goruldu", label: "Görülme", olaylar: ["goruldu"] },
  {
    id: "ilk_etkilesim",
    label: "İlk etkileşim",
    olaylar: [] as string[],
  },
  {
    id: "form_adim_sorun",
    label: "Adım · Hizmet",
    olaylar: ["form_adim_sorun", "service_selected"],
  },
  {
    id: "form_adim_ara",
    label: "Adım · Konum/hedef",
    olaylar: ["form_adim_konum", "form_adim_hedef", "form_adim_detay"],
  },
  {
    id: "form_adim_bilgi",
    label: "Adım · Telefon",
    olaylar: ["form_adim_bilgi"],
  },
  { id: "otp_gonder", label: "OTP gönder", olaylar: ["otp_gonder"] },
  {
    id: "otp_dogrulandi",
    label: "OTP doğrula",
    olaylar: ["otp_dogrulandi"],
  },
  { id: "talep_olustur", label: "Talep", olaylar: ["talep_olustur"] },
] as const;

export type MusteriFunnelHuniAdim = {
  adim: string;
  label: string;
  sessionSayisi: number;
  oncekiOran: number | null;
};

export type MusteriFunnelOlaySatir = {
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
      if (o.startsWith("form_adim_")) return true;
      if (o === "service_selected") return true;
      if (o === "otp_gonder") return true;
      if (o === "otp_dogrulandi") return true;
      if (o === "talep_olustur") return true;
    }
    return false;
  }
  return adimOlaylari.some((o) => olaylar.has(o));
}

export function musteriFunnelSessionHuniHesapla(
  rows: MusteriFunnelOlaySatir[]
): MusteriFunnelHuniAdim[] {
  const bySession = new Map<string, Set<string>>();
  for (const r of rows) {
    const sid = r.session_id?.trim();
    if (!sid) continue;
    if (!bySession.has(sid)) bySession.set(sid, new Set());
    bySession.get(sid)!.add(String(r.olay));
  }

  const adimlar = MUSTERI_FUNNEL_HUNI_ADIMLARI.map((a) => {
    let n = 0;
    const form = a.id === "ilk_etkilesim";
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

export type MusteriFunnelGunluk = {
  gun: string;
  goruldu: number;
  talep: number;
};

export function musteriFunnelGunTr(iso: string): string {
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
  return musteriFunnelGunTr(d.toISOString());
}

export function musteriFunnelGunlukHesapla(
  rows: MusteriFunnelOlaySatir[],
  aralik?: { from: string; to: string }
): MusteriFunnelGunluk[] {
  const map = new Map<string, { goruldu: number; talep: number }>();
  for (const r of rows) {
    if (!r.olusturulma) continue;
    const t = new Date(r.olusturulma);
    if (Number.isNaN(t.getTime())) continue;
    const gun = musteriFunnelGunTr(r.olusturulma);
    if (!map.has(gun)) map.set(gun, { goruldu: 0, talep: 0 });
    const m = map.get(gun)!;
    if (r.olay === "goruldu") m.goruldu += 1;
    if (r.olay === "talep_olustur") m.talep += 1;
  }

  if (aralik?.from && aralik?.to) {
    const out: MusteriFunnelGunluk[] = [];
    let gun = aralik.from;
    let guvenlik = 0;
    while (gun <= aralik.to && guvenlik < 400) {
      const v = map.get(gun) ?? { goruldu: 0, talep: 0 };
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

export type MusteriFunnelOlayHacmi = {
  olay: string;
  sayi: number;
  byFunnel: Record<string, number>;
};

export function musteriFunnelOlayHacmiHesapla(
  rows: MusteriFunnelOlaySatir[]
): MusteriFunnelOlayHacmi[] {
  const map = new Map<
    string,
    { sayi: number; byFunnel: Record<string, number> }
  >();
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

export function musteriFunnelBenzersizSession(
  rows: MusteriFunnelOlaySatir[]
): number {
  const s = new Set<string>();
  for (const r of rows) {
    const sid = r.session_id?.trim();
    if (sid) s.add(sid);
  }
  return s.size;
}
