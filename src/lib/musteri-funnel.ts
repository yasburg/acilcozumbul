/**
 * Müşteri talep funnel katalogu + PostHog / GA4.
 * Google Ads primary conversion: başarılı talep (`gtagAdsFiyatTeklifiDonusumu`).
 * Meta/TikTok Lead: talep; Contact + GA `teklif_secildi`: OTP sonrası teklif seçimi.
 */

import { gtagOlay } from "@/lib/gtag";
import { posthogOlayYakala } from "@/lib/posthog-client";

export const MUSTERI_FUNNEL_HARFLER = ["a", "b"] as const;

export type MusteriFunnelId = (typeof MUSTERI_FUNNEL_HARFLER)[number];

export type MusteriFunnelTanim = {
  id: MusteriFunnelId;
  etiket: string;
  yol: string;
  aktif: boolean;
  /** Kısa açıklama (panel) */
  aciklama: string;
};

export const MUSTERI_FUNNELS: Record<MusteriFunnelId, MusteriFunnelTanim> = {
  a: {
    id: "a",
    etiket: "Klasik anasayfa",
    yol: "/a",
    aktif: true,
    aciklama:
      "Konum → hizmet → iletişim → detay → hedef → talep · OTP teklif seçiminde · noindex",
  },
  b: {
    id: "b",
    etiket: "Dönüşüm landing",
    yol: "/b",
    aktif: true,
    aciklama:
      "Hizmet → hedef → iletişim → talep · OTP teklif seçiminde · noindex",
  },
};

export function musteriFunnelMi(v: string): v is MusteriFunnelId {
  return (MUSTERI_FUNNEL_HARFLER as readonly string[]).includes(v);
}

export function musteriFunnelGetir(v: string): MusteriFunnelTanim | null {
  if (!musteriFunnelMi(v)) return null;
  return MUSTERI_FUNNELS[v];
}

export function musteriFunnelYolu(v: MusteriFunnelId): string {
  return MUSTERI_FUNNELS[v].yol;
}

export function musteriFunnelAktifListe(): MusteriFunnelTanim[] {
  return MUSTERI_FUNNEL_HARFLER.map((id) => MUSTERI_FUNNELS[id]).filter(
    (f) => f.aktif
  );
}

export function musteriFunnelOlay(
  olay: string,
  props?: Record<string, unknown>
): void {
  posthogOlayYakala(olay, props);
  gtagOlay(olay, props);
}

/** Eski DB funnel_events + analitik (geriye uyum) */
export function musteriFunnelKaydet(
  olay: string,
  telefon?: string,
  props?: Record<string, unknown>
): void {
  void fetch("/api/musteri/funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ olay, telefon }),
  });
  musteriFunnelOlay(olay, props);
}
