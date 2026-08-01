import {
  abonelikIslemVarMi,
  abonelikNextRetryAt,
  abonelikPaketKredisi,
  abonelikRenewsAtHesapla,
  getAbonelikByGarantiOrderId,
  getAktifAbonelik,
  guncelleAbonelik,
  kaydetAbonelikIslem,
  listAboneliklerYenilemeKontrol,
  listIptalDonemSonuAbonelikler,
} from "./abonelik-db";
import { getCekiciById, updateCekici } from "./db";
import {
  garantiOrderListInq,
  type GarantiOrderTxn,
} from "./garanti/orderlistinq";
import { garantiYapilandirildi } from "./garanti/config";
import {
  abonelikKrediSifirlaVeYukle,
  abonelikKrediYak,
} from "./kredi-bakiye";
import type { CekiciAbonelik } from "./types";

const GRACE_MS = 24 * 60 * 60 * 1000;
const MAX_RETRY = 3;

export type YenilemeOzet = {
  processedRenewals: number;
  pastDue: number;
  expired: number;
  periodEndBurned: number;
  skipped: number;
  results: Array<Record<string, unknown>>;
};

/**
 * Abonelik dönem hakkı biterse (iptal/expire) kalan abonelik kredisini yakar.
 * Yeniden abone olmuşsa dokunmaz (yeni dönemin bakiyesini silmesin).
 */
export async function cekiciAbonelikKredisiniYak(
  abonelik: CekiciAbonelik,
  eventId: string
): Promise<"ok" | "skip"> {
  if (await abonelikIslemVarMi(eventId)) return "skip";

  const aktif = await getAktifAbonelik(abonelik.cekiciId);
  if (aktif && aktif.id !== abonelik.id) return "skip";

  const cekici = await getCekiciById(abonelik.cekiciId);
  if (!cekici) return "skip";

  const yakilan = abonelikKrediYak(cekici);
  const kaydedildi = await kaydetAbonelikIslem({
    abonelikId: abonelik.id,
    cekiciId: abonelik.cekiciId,
    tip: "period_end",
    tutarTl: 0,
    kredi: yakilan,
    garantiOrderId: abonelik.garantiOrderId,
    eventId,
  });
  if (!kaydedildi) return "skip";

  if (yakilan > 0) {
    await updateCekici(cekici);
  }
  return "ok";
}

function yyyymmdd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function yenilemeIsle(tx: GarantiOrderTxn): Promise<"ok" | "skip" | "fail"> {
  if (!tx.orderId || !tx.authAmount) return "skip";

  const abonelik = await getAbonelikByGarantiOrderId(tx.orderId);
  if (!abonelik) return "skip";

  // İlk çekimi yenileme sayma
  if (
    tx.retrefNum &&
    abonelik.garantiOriginalRetrefNum &&
    tx.retrefNum === abonelik.garantiOriginalRetrefNum
  ) {
    return "skip";
  }

  const eventId = `renewal_${tx.orderId}_${tx.retrefNum ?? tx.lastTrxDate ?? "x"}`;
  if (await abonelikIslemVarMi(eventId)) return "skip";

  const kredi = abonelikPaketKredisi(abonelik.paketTl);
  if (kredi <= 0) return "fail";

  const cekici = await getCekiciById(abonelik.cekiciId);
  if (!cekici) return "fail";

  const kaydedildi = await kaydetAbonelikIslem({
    abonelikId: abonelik.id,
    cekiciId: abonelik.cekiciId,
    tip: "renewal",
    tutarTl: Number(tx.authAmount) / 100,
    kredi,
    garantiOrderId: tx.orderId,
    eventId,
  });
  if (!kaydedildi) return "skip";

  // Dönem hakkı yenilenir; satın alınan (kalıcı) krediye dokunulmaz
  abonelikKrediSifirlaVeYukle(cekici, kredi);
  await updateCekici(cekici);

  await guncelleAbonelik(abonelik.id, {
    status: "active",
    renewsAt: abonelikRenewsAtHesapla(),
    retryCount: 0,
    nextRetryAt: null,
  });

  return "ok";
}

/** Geçmiş renews_at → past_due / expired */
export async function abonelikPastDueIsle(): Promise<{
  pastDue: number;
  expired: number;
}> {
  const liste = await listAboneliklerYenilemeKontrol();
  const now = Date.now();
  let pastDue = 0;
  let expired = 0;

  for (const a of liste) {
    if (!a.renewsAt) continue;
    const renewMs = new Date(a.renewsAt).getTime();
    if (renewMs > now - GRACE_MS) continue;

    // Backoff dolmadan tekrar sayaç artırma
    if (
      a.status === "past_due" &&
      a.nextRetryAt &&
      new Date(a.nextRetryAt).getTime() > now
    ) {
      continue;
    }

    if (a.retryCount >= MAX_RETRY) {
      const expiredEvent = `expired_${a.id}_${a.retryCount}`;
      if (!(await abonelikIslemVarMi(expiredEvent))) {
        await guncelleAbonelik(a.id, {
          status: "expired",
          endsAt: new Date().toISOString(),
          nextRetryAt: null,
        });
        await kaydetAbonelikIslem({
          abonelikId: a.id,
          cekiciId: a.cekiciId,
          tip: "expired",
          tutarTl: 0,
          kredi: 0,
          garantiOrderId: a.garantiOrderId,
          eventId: expiredEvent,
        });
        await cekiciAbonelikKredisiniYak(a, `period_end_${a.id}`);
        expired++;
      }
      continue;
    }

    const nextCount = a.retryCount + 1;
    const failEvent = `payment_failed_${a.id}_${nextCount}`;
    if (await abonelikIslemVarMi(failEvent)) continue;

    await guncelleAbonelik(a.id, {
      status: "past_due",
      retryCount: nextCount,
      nextRetryAt: abonelikNextRetryAt(nextCount),
    });
    await kaydetAbonelikIslem({
      abonelikId: a.id,
      cekiciId: a.cekiciId,
      tip: "payment_failed",
      tutarTl: 0,
      kredi: 0,
      garantiOrderId: a.garantiOrderId,
      eventId: failEvent,
    });
    pastDue++;
  }

  return { pastDue, expired };
}

/** İptal sonrası renews_at dolunca kullanılmayan abonelik kredisini yak */
export async function abonelikIptalDonemSonuIsle(): Promise<number> {
  const liste = await listIptalDonemSonuAbonelikler();
  let burned = 0;
  for (const a of liste) {
    const r = await cekiciAbonelikKredisiniYak(a, `period_end_${a.id}`);
    if (r === "ok") burned++;
  }
  return burned;
}

export async function processGarantiAbonelikYenilemeleri(opts?: {
  startDate?: string;
  endDate?: string;
}): Promise<YenilemeOzet> {
  const results: Array<Record<string, unknown>> = [];
  let processedRenewals = 0;
  let skipped = 0;

  if (garantiYapilandirildi()) {
    const end = opts?.endDate ?? yyyymmdd(new Date());
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - 1);
    const start = opts?.startDate ?? yyyymmdd(startDateObj);

    const inquiry = await garantiOrderListInq({ startDate: start, endDate: end });
    if (!inquiry.basarili) {
      results.push({
        status: "inquiry_failed",
        code: inquiry.respCode,
        message: inquiry.message,
      });
    } else {
      for (const tx of inquiry.transactions) {
        try {
          const r = await yenilemeIsle(tx);
          if (r === "ok") {
            processedRenewals++;
            results.push({ orderId: tx.orderId, status: "renewed" });
          } else if (r === "skip") {
            skipped++;
          } else {
            results.push({ orderId: tx.orderId, status: "fail" });
          }
        } catch (e) {
          results.push({
            orderId: tx.orderId,
            status: "error",
            error: e instanceof Error ? e.message : "unknown",
          });
        }
      }
    }
  }

  const { pastDue, expired } = await abonelikPastDueIsle();
  const periodEndBurned = await abonelikIptalDonemSonuIsle();

  return {
    processedRenewals,
    pastDue,
    expired,
    periodEndBurned,
    skipped,
    results,
  };
}
