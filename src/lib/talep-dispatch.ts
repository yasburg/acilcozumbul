import { randomUUID } from "crypto";
import { getCekiciler, getTalepById, updateTalep } from "./db";
import { ihaleAcikMi } from "./ihale";
import { dakikaYasi, kmBucket, marketplaceOlayKaydet } from "./marketplace-events";
import { notifyCekiciler } from "./sms";
import { dispatchBatchBoyutu, siralaUygunCekiciler } from "./smart-matching";
import { getSupabaseAdmin } from "./supabase/admin";
import { isDbConfigured, pgQuery } from "./pg";
import { bildirimCopyVaryanti } from "./marketplace-p2";
import type { Talep } from "./types";

type DispatchReason = "initial" | "zero_offer_recovery" | "manual_retry";
type DispatchRow = { id: string; talep_id: string; batch: number; reason: DispatchReason; status: string };

/** Kontrollü rollout: açıkça açılmadıkça mevcut kredi/SMS dispatch davranışı korunur. */
const PROGRESSIVE_DISPATCH_AKTIF = process.env.MARKETPLACE_PROGRESSIVE_DISPATCH === "true";

function migrationEksik(error: unknown): boolean {
  const m = error instanceof Error ? error.message : String(error);
  return /talep_dispatch|does not exist|schema cache/i.test(m);
}

async function dispatchKaydet(row: Record<string, unknown>): Promise<boolean> {
  try {
    const { error } = await getSupabaseAdmin().from("talep_dispatches").insert(row);
    if (error?.code === "23505") return false;
    if (error) throw error;
    return true;
  } catch (error) {
    if (migrationEksik(error)) {
      console.error("[talep-dispatch] 071 migration gerekli");
      return false;
    }
    throw error;
  }
}

/** Request kalıcı olduktan sonra ilk dalgayı ve iki recovery dalgasını planlar. */
export async function talepDispatchPlanla(talep: Talep): Promise<DispatchRow[]> {
  if (!PROGRESSIVE_DISPATCH_AKTIF) return [];
  const now = new Date();
  const plan: Array<{ batch: number; delayMs: number; reason: DispatchReason }> = [
    { batch: 1, delayMs: 0, reason: "initial" },
    { batch: 2, delayMs: 45_000, reason: "zero_offer_recovery" },
    { batch: 3, delayMs: 90_000, reason: "zero_offer_recovery" },
  ];
  const rows: DispatchRow[] = [];
  for (const item of plan) {
    const row: DispatchRow = {
      id: randomUUID(), talep_id: talep.id, batch: item.batch, reason: item.reason, status: "scheduled",
    };
    const kaydedildi = await dispatchKaydet({
      id: row.id,
      talep_id: row.talep_id,
      batch: row.batch,
      reason: row.reason,
      status: row.status,
      scheduled_at: new Date(now.getTime() + item.delayMs).toISOString(),
    });
    if (kaydedildi) rows.push(row);
  }
  return rows;
}

async function dispatchAdaylariniKaydet(dispatch: DispatchRow, talep: Talep) {
  const tumCekiciler = await getCekiciler();
  const dahaOnceBildirilen = new Set(talep.bildirilenCekiciIds ?? []);
  const sirali = siralaUygunCekiciler(talep, tumCekiciler)
    .filter(({ cekici }) => !dahaOnceBildirilen.has(cekici.id))
    .slice(0, dispatchBatchBoyutu(dispatch.batch));

  await Promise.all(
    sirali.map(({ cekici, score, distanceKm }, index) =>
      getSupabaseAdmin().from("talep_dispatch_candidates").upsert({
        dispatch_id: dispatch.id,
        cekici_id: cekici.id,
        rank: index + 1,
        score,
        distance_km: distanceKm,
      }, { onConflict: "dispatch_id,cekici_id" })
    )
  );

  await Promise.all(
    sirali.map(({ cekici, distanceKm }, index) =>
      marketplaceOlayKaydet({
        eventType: "eligible_driver_found",
        talepId: talep.id,
        cekiciId: cekici.id,
        dispatchId: dispatch.id,
        eventKey: `eligible:${dispatch.id}:${cekici.id}`,
        properties: { batch: dispatch.batch, rank: index + 1, distance_bucket: kmBucket(distanceKm), request_age_min: dakikaYasi(talep.olusturulma) },
      })
    )
  );
  return sirali;
}

export async function talepDispatchCalistir(dispatch: DispatchRow, baseUrl: string): Promise<number> {
  const talep = await getTalepById(dispatch.talep_id);
  if (!talep || !ihaleAcikMi(talep) || talep.teklifler.some((t) => t.durum === "aktif")) {
    await getSupabaseAdmin().from("talep_dispatches").update({ status: "skipped", completed_at: new Date().toISOString() }).eq("id", dispatch.id);
    return 0;
  }

  try {
    // Cron birden çok instance'ta çalışabilir; gerçek DB'de satırı atomik claim et.
    if (isDbConfigured()) {
      const claim = await pgQuery<{ id: string }>(
        'update public."talep_dispatches" set status = $2, started_at = now() where id = $1 and status = $3 returning id',
        [dispatch.id, "processing", "scheduled"]
      );
      if (claim.rows.length === 0) return 0;
    } else {
      await getSupabaseAdmin().from("talep_dispatches").update({ status: "processing", started_at: new Date().toISOString() }).eq("id", dispatch.id).eq("status", "scheduled");
    }
    const adaylar = await dispatchAdaylariniKaydet(dispatch, talep);
    const ids = adaylar.map((a) => a.cekici.id);
    if (ids.length === 0) {
      await getSupabaseAdmin().from("talep_dispatches").update({ status: "completed", candidate_count: 0, notified_count: 0, completed_at: new Date().toISOString() }).eq("id", dispatch.id);
      return 0;
    }
    await Promise.all(adaylar.map(({ cekici }) => marketplaceOlayKaydet({
      eventType: "driver_notification_attempted", talepId: talep.id, cekiciId: cekici.id, dispatchId: dispatch.id,
      eventKey: `notification-attempt:${dispatch.id}:${cekici.id}`,
      properties: { channel: "sms", batch: dispatch.batch, request_age_min: dakikaYasi(talep.olusturulma), credit_charged: "package", notification_copy_variant: bildirimCopyVaryanti(talep, cekici) },
    })));
    // Her dalga daha önce bildirim almamış yeni çekicilere gider; mevcut SMS/kredi kuralı aynen uygulanır.
    const bildirilen = await notifyCekiciler(talep, baseUrl, [], {
      yalnizCekiciIds: ids,
    });
    const bildirilenSet = new Set(bildirilen);
    await Promise.all(ids.map(async (cekiciId) => {
      const ok = bildirilenSet.has(cekiciId);
      await getSupabaseAdmin().from("talep_dispatch_candidates").update({
        notified: ok, notification_status: ok ? "provider_accepted" : "failed",
      }).eq("dispatch_id", dispatch.id).eq("cekici_id", cekiciId);
      await getSupabaseAdmin().from("talep_notification_attempts").insert({
        talep_id: talep.id, cekici_id: cekiciId, dispatch_id: dispatch.id, channel: "sms",
        status: ok ? "provider_accepted" : "failed", credit_charged: 0,
      });
      await marketplaceOlayKaydet({
        eventType: ok ? "driver_notification_provider_accepted" : "driver_notification_failed",
        talepId: talep.id, cekiciId, dispatchId: dispatch.id,
        eventKey: `notification-result:${dispatch.id}:${cekiciId}`,
        properties: { channel: "sms", batch: dispatch.batch },
      });
    }));
    talep.bildirilenCekiciIds = [...new Set([...(talep.bildirilenCekiciIds ?? []), ...bildirilen])];
    await updateTalep(talep);
    await getSupabaseAdmin().from("talep_dispatches").update({
      status: "completed", candidate_count: ids.length, notified_count: bildirilen.length, completed_at: new Date().toISOString(),
    }).eq("id", dispatch.id);
    return bildirilen.length;
  } catch (error) {
    console.error("[talep-dispatch] çalıştır", dispatch.id, error);
    await getSupabaseAdmin().from("talep_dispatches").update({
      status: "failed", error_message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500), completed_at: new Date().toISOString(),
    }).eq("id", dispatch.id);
    return 0;
  }
}

export async function ilkTalepDispatchCalistir(talep: Talep, baseUrl: string): Promise<number> {
  const dispatchler = await talepDispatchPlanla(talep);
  const ilk = dispatchler.find((d) => d.batch === 1);
  if (ilk) return talepDispatchCalistir(ilk, baseUrl);
  // Güvenli rollout: migration henüz uygulanmadıysa mevcut doğrudan dispatch
  // davranışına geri dön; talep zaten kalıcı olarak yazılmıştır.
  const bildirilen = await notifyCekiciler(talep, baseUrl);
  talep.bildirilenCekiciIds = [...new Set([...(talep.bildirilenCekiciIds ?? []), ...bildirilen])];
  await updateTalep(talep);
  return bildirilen.length;
}

/** Cron için: vadesi geçmiş tüm scheduled dalgalar, teklif geldiyse otomatik atlanır. */
export async function vadesiGelenTalepDispatchleriniCalistir(baseUrl: string): Promise<{ processed: number; notified: number }> {
  const { data, error } = await getSupabaseAdmin().from("talep_dispatches")
    .select("*").eq("status", "scheduled").lte("scheduled_at", new Date().toISOString()).order("scheduled_at", { ascending: true }).limit(100);
  if (error) throw error;
  let notified = 0;
  for (const row of (data ?? []) as DispatchRow[]) notified += await talepDispatchCalistir(row, baseUrl);
  return { processed: (data ?? []).length, notified };
}

/** Süresi dolan açık ihaleler virtual state'te kalır; funnel için tekil expiry olayı yazılır. */
export async function suresiDolanTalepOlaylariniKaydet(): Promise<number> {
  const { data, error } = await getSupabaseAdmin().from("talepler")
    .select("id, olusturulma, ihale_bitis").in("durum", ["ihalede", "yeniden_ihalede"])
    .lte("ihale_bitis", new Date().toISOString()).limit(200);
  if (error) throw error;
  await Promise.all((data ?? []).map((row: { id: string; olusturulma: string }) => marketplaceOlayKaydet({
    eventType: "request_expired", talepId: row.id, eventKey: `expired:${row.id}`,
    properties: { request_age_min: dakikaYasi(row.olusturulma) },
  })));
  return (data ?? []).length;
}
