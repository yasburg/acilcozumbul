/**
 * Müşteri talep funnel — PostHog + GA4 (`gtagOlay`).
 * Google Ads primary conversion yalnızca başarılı talepte
 * (`gtagAdsFiyatTeklifiDonusumu`) kalır; ara event’ler Ads’e gönderilmez.
 */

import { gtagOlay } from "@/lib/gtag";
import { posthogOlayYakala } from "@/lib/posthog-client";

export function musteriFunnelOlay(
  olay: string,
  props?: Record<string, unknown>
): void {
  posthogOlayYakala(olay, props);
  gtagOlay(olay, props);
}

/** DB funnel allowlist ile uyumlu olaylar için API + analitik */
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
