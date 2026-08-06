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
  "form_adim_fotograf",
  "form_adim_arac_tipi",
  "form_adim_arac_modeli",
  "form_adim_ek_detay",
  "form_adim_ihale",
  "form_adim_hedef",
  "service_selected",
  "talep_olustur",
  "otp_gonder",
  "otp_dogrulandi",
  "otp_hata",
  "teklif_secildi",
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
  teklifSecildi: number;
  otpOran: number | null;
  talepOran: number | null;
  teklifOran: number | null;
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
    const teklifSecildi = m.get("teklif_secildi") ?? 0;
    return {
      funnel: t.id,
      etiket: t.etiket,
      yol: t.yol,
      goruldu,
      otpGonder,
      talep,
      teklifSecildi,
      /** OTP / talep — doğrulama teklif seçiminde */
      otpOran: talep > 0 ? otpGonder / talep : null,
      talepOran: goruldu > 0 ? talep / goruldu : null,
      teklifOran: talep > 0 ? teklifSecildi / talep : null,
    };
  });
}

export type MusteriFunnelHuniAdimTanim = {
  id: string;
  label: string;
  olaylar: readonly string[];
  /** Herhangi bir form / OTP / talep etkileşimi */
  ilkEtkilesim?: boolean;
};

/**
 * Funnel A: konum → hizmet → foto/araç/ek/ihale → hedef → talep →
 * iletişim → OTP → teklif seçildi (MusteriAnaSayfa; iletişim teklif seçiminde)
 */
export const MUSTERI_FUNNEL_HUNI_A: readonly MusteriFunnelHuniAdimTanim[] = [
  { id: "goruldu", label: "Görülme", olaylar: ["goruldu"] },
  { id: "form_adim_konum", label: "Adım · Konum", olaylar: ["form_adim_konum"] },
  {
    id: "form_adim_sorun",
    label: "Adım · Hizmet",
    olaylar: ["form_adim_sorun", "service_selected"],
  },
  {
    id: "form_adim_fotograf",
    label: "Adım · Fotoğraf",
    /* form_adim_detay: eski tek detay adımı (geriye uyum) */
    olaylar: ["form_adim_fotograf", "form_adim_detay"],
  },
  {
    id: "form_adim_arac_tipi",
    label: "Adım · Araç tipi",
    olaylar: ["form_adim_arac_tipi", "form_adim_detay"],
  },
  {
    id: "form_adim_arac_modeli",
    label: "Adım · Araç modeli",
    olaylar: ["form_adim_arac_modeli", "form_adim_detay"],
  },
  {
    id: "form_adim_ek_detay",
    label: "Adım · Ek detay",
    olaylar: ["form_adim_ek_detay", "form_adim_detay"],
  },
  {
    id: "form_adim_ihale",
    label: "Adım · İhale süresi",
    olaylar: ["form_adim_ihale", "form_adim_detay"],
  },
  { id: "form_adim_hedef", label: "Adım · Hedef", olaylar: ["form_adim_hedef"] },
  { id: "talep_olustur", label: "Talep", olaylar: ["talep_olustur"] },
  {
    id: "form_adim_bilgi",
    label: "İletişim (teklif seç)",
    olaylar: ["form_adim_bilgi"],
  },
  {
    id: "otp_gonder",
    label: "OTP (teklif seç)",
    olaylar: ["otp_gonder"],
  },
  { id: "otp_dogrulandi", label: "OTP doğrula", olaylar: ["otp_dogrulandi"] },
  {
    id: "teklif_secildi",
    label: "Teklif seçildi",
    olaylar: ["teklif_secildi"],
  },
];

/**
 * Funnel B: hizmet → hedef → talep → iletişim → OTP → teklif
 * (MusteriDonusumSayfa; iletişim teklif seçiminde)
 */
export const MUSTERI_FUNNEL_HUNI_B: readonly MusteriFunnelHuniAdimTanim[] = [
  { id: "goruldu", label: "Görülme", olaylar: ["goruldu"] },
  {
    id: "form_adim_sorun",
    label: "Adım · Hizmet",
    olaylar: ["form_adim_sorun", "service_selected"],
  },
  { id: "form_adim_hedef", label: "Adım · Hedef", olaylar: ["form_adim_hedef"] },
  { id: "talep_olustur", label: "Talep", olaylar: ["talep_olustur"] },
  {
    id: "form_adim_bilgi",
    label: "İletişim (teklif seç)",
    olaylar: ["form_adim_bilgi"],
  },
  {
    id: "otp_gonder",
    label: "OTP (teklif seç)",
    olaylar: ["otp_gonder"],
  },
  { id: "otp_dogrulandi", label: "OTP doğrula", olaylar: ["otp_dogrulandi"] },
  {
    id: "teklif_secildi",
    label: "Teklif seçildi",
    olaylar: ["teklif_secildi"],
  },
];

/**
 * A+B ortak: hizmet → talep → iletişim → OTP → teklif.
 * Detay alt adımları A’ya özel; ortak hunide tek «detay» kilometre taşı.
 */
export const MUSTERI_FUNNEL_HUNI_ORTAK: readonly MusteriFunnelHuniAdimTanim[] = [
  { id: "goruldu", label: "Görülme", olaylar: ["goruldu"] },
  {
    id: "ilk_etkilesim",
    label: "İlk etkileşim",
    olaylar: [],
    ilkEtkilesim: true,
  },
  {
    id: "form_adim_sorun",
    label: "Hizmet seçimi",
    olaylar: ["form_adim_sorun", "service_selected"],
  },
  {
    id: "form_adim_detay",
    label: "Detay adımları",
    olaylar: [
      "form_adim_detay",
      "form_adim_fotograf",
      "form_adim_arac_tipi",
      "form_adim_arac_modeli",
      "form_adim_ek_detay",
      "form_adim_ihale",
    ],
  },
  { id: "talep_olustur", label: "Talep", olaylar: ["talep_olustur"] },
  {
    id: "form_adim_bilgi",
    label: "İletişim (teklif seç)",
    olaylar: ["form_adim_bilgi"],
  },
  {
    id: "otp_gonder",
    label: "OTP (teklif seç)",
    olaylar: ["otp_gonder"],
  },
  { id: "otp_dogrulandi", label: "OTP doğrula", olaylar: ["otp_dogrulandi"] },
  {
    id: "teklif_secildi",
    label: "Teklif seçildi",
    olaylar: ["teklif_secildi"],
  },
];

/** @deprecated MUSTERI_FUNNEL_HUNI_ORTAK kullanın */
export const MUSTERI_FUNNEL_HUNI_ADIMLARI = MUSTERI_FUNNEL_HUNI_ORTAK;

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
  adim: MusteriFunnelHuniAdimTanim
): boolean {
  if (adim.ilkEtkilesim) {
    for (const o of olaylar) {
      if (o.startsWith("form_adim_")) return true;
      if (o === "service_selected") return true;
      if (o === "otp_gonder") return true;
      if (o === "otp_dogrulandi") return true;
      if (o === "talep_olustur") return true;
      if (o === "teklif_secildi") return true;
    }
    return false;
  }
  return adim.olaylar.some((o) => olaylar.has(o));
}

/** Session’ın ulaştığı en ileri huni adımı (−1 = hiç) */
export function musteriFunnelSessionMaxAdim(
  olaylar: Set<string>,
  adimlar: readonly MusteriFunnelHuniAdimTanim[]
): number {
  let max = -1;
  for (let i = 0; i < adimlar.length; i++) {
    if (sessionOlayEslesir(olaylar, adimlar[i]!)) max = i;
  }
  return max;
}

export function musteriFunnelHuniAdimlariSec(
  funnel?: string | null
): readonly MusteriFunnelHuniAdimTanim[] {
  if (funnel === "a") return MUSTERI_FUNNEL_HUNI_A;
  if (funnel === "b") return MUSTERI_FUNNEL_HUNI_B;
  return MUSTERI_FUNNEL_HUNI_ORTAK;
}

/**
 * Session hunisi — kümülatif (monoton): adım i = en az i’ye ulaşan session sayısı.
 * Böylece sonraki adım öncekinden büyük olamaz; %100+ üretmez.
 */
export function musteriFunnelSessionHuniHesapla(
  rows: MusteriFunnelOlaySatir[],
  adimTanimlari: readonly MusteriFunnelHuniAdimTanim[] = MUSTERI_FUNNEL_HUNI_ORTAK
): MusteriFunnelHuniAdim[] {
  const bySession = new Map<string, Set<string>>();
  for (const r of rows) {
    const sid = r.session_id?.trim();
    if (!sid) continue;
    if (!bySession.has(sid)) bySession.set(sid, new Set());
    bySession.get(sid)!.add(String(r.olay));
  }

  const counts = adimTanimlari.map(() => 0);
  for (const olaylar of bySession.values()) {
    const max = musteriFunnelSessionMaxAdim(olaylar, adimTanimlari);
    for (let i = 0; i <= max; i++) counts[i]! += 1;
  }

  return adimTanimlari.map((a, i) => {
    const sessionSayisi = counts[i]!;
    const onceki = i === 0 ? null : counts[i - 1]!;
    return {
      adim: a.id,
      label: a.label,
      sessionSayisi,
      oncekiOran:
        onceki != null && onceki > 0 ? sessionSayisi / onceki : null,
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
