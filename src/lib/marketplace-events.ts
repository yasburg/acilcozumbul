import { createHash } from "crypto";
import { getSupabaseAdmin } from "./supabase/admin";

export type MarketplaceEventType =
  | "customer_request_created"
  | "eligible_driver_found"
  | "driver_notification_attempted"
  | "driver_notification_provider_accepted"
  | "driver_notification_failed"
  | "driver_notification_opened"
  | "driver_request_viewed"
  | "driver_bid_started"
  | "driver_bid_submitted"
  | "customer_bid_viewed"
  | "customer_bid_selected"
  | "job_started"
  | "job_completed"
  | "request_expired"
  | "request_cancelled";

export type MarketplaceEvent = {
  eventType: MarketplaceEventType;
  talepId?: string;
  cekiciId?: string;
  dispatchId?: string;
  /** Tekrar eden poll/redirect çağrılarını tek olaya indirmek için stabil anahtar. */
  eventKey?: string;
  /** Telefon, tam adres, isim veya koordinat koymayın. */
  properties?: Record<string, unknown>;
};

function defaultEventKey(event: MarketplaceEvent): string {
  const canonical = JSON.stringify({
    t: event.eventType,
    request: event.talepId ?? null,
    driver: event.cekiciId ?? null,
    dispatch: event.dispatchId ?? null,
    p: event.properties ?? {},
  });
  return `${event.eventType}:${createHash("sha256").update(canonical).digest("hex").slice(0, 32)}`;
}

/**
 * Funnel kaydında PII yoktur. Tablo henüz deploy edilmemişse müşteri akışını
 * kesmemek için yalnızca loglayıp devam eder; migration 071 zorunludur.
 */
export async function marketplaceOlayKaydet(event: MarketplaceEvent): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin().from("marketplace_events").insert({
      event_key: event.eventKey ?? defaultEventKey(event),
      event_type: event.eventType,
      talep_id: event.talepId ?? null,
      cekici_id: event.cekiciId ?? null,
      dispatch_id: event.dispatchId ?? null,
      properties: event.properties ?? {},
    });
    if (error && error.code !== "23505") throw error;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/marketplace_events|does not exist|schema cache/i.test(message)) {
      console.error("[marketplace-events] 071 migration gerekli");
      return;
    }
    console.error("[marketplace-events] kayıt", error);
  }
}

export function dakikaYasi(olusturulma: string, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(olusturulma).getTime()) / 60_000));
}

export function kmBucket(km: number | null | undefined): string | null {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 3) return "0_3";
  if (km < 10) return "3_10";
  if (km < 25) return "10_25";
  if (km < 50) return "25_50";
  return "50_plus";
}
