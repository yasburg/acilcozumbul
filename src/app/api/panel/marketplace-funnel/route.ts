import { NextRequest, NextResponse } from "next/server";
import { getPanelSession } from "@/lib/panel-auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ADIMLAR = [
  "customer_request_created", "eligible_driver_found", "driver_notification_attempted",
  "driver_notification_provider_accepted", "driver_notification_opened", "driver_request_viewed",
  "driver_bid_started", "driver_bid_submitted", "customer_bid_viewed", "customer_bid_selected", "job_completed",
] as const;

/** Yeni funnel eventleri için operasyon dashboard veri kaynağı (PII içermez). */
export async function GET(request: NextRequest) {
  const session = await getPanelSession(request);
  if (!session) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const fromRaw = request.nextUrl.searchParams.get("from");
  const from = fromRaw && !Number.isNaN(new Date(fromRaw).getTime())
    ? new Date(fromRaw).toISOString()
    : new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString();
  try {
    const { data, error } = await getSupabaseAdmin().from("marketplace_events")
      .select("event_type, talep_id, cekici_id, occurred_at, properties")
      .gte("occurred_at", from).order("occurred_at", { ascending: true }).limit(50_000);
    if (error) throw error;
    const events = (data ?? []) as Array<{ event_type: string; talep_id: string | null; cekici_id: string | null }>;
    const byStep = Object.fromEntries(ADIMLAR.map((step) => [step, 0])) as Record<string, number>;
    const requestsByStep = Object.fromEntries(ADIMLAR.map((step) => [step, new Set<string>()])) as Record<string, Set<string>>;
    for (const event of events) {
      if (!(event.event_type in byStep)) continue;
      byStep[event.event_type] += 1;
      if (event.talep_id) requestsByStep[event.event_type].add(event.talep_id);
    }
    const requestCounts = Object.fromEntries(ADIMLAR.map((step) => [step, requestsByStep[step].size]));
    return NextResponse.json({
      from,
      eventCounts: byStep,
      requestCounts,
      eventsCaptured: events.length,
      note: "Delivery yalnızca provider kabulüdür; operatör teslim/open verisi yoksa delivered metriği raporlanmaz.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = /marketplace_events|does not exist|schema cache/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: status === 503 ? "071 marketplace migration gerekli." : message }, { status });
  }
}
