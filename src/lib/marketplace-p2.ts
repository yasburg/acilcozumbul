import { createHash } from "crypto";
import type { Cekici, Talep } from "./types";

export type BildirimCopyVaryanti = "control" | "urgency_context";

/** P2 deneyleri varsayılan olarak kapalıdır; kredi, hedef kitle ve gönderim sıklığı değişmez. */
export function bildirimCopyDeneyiAcikMi(): boolean {
  return process.env.MARKETPLACE_NOTIFICATION_COPY_EXPERIMENT === "true";
}

export function suggestedPriceDeneyiAcikMi(): boolean {
  return process.env.MARKETPLACE_SUGGESTED_PRICE_EXPERIMENT === "true";
}

/** Aynı çekici-talep çifti deney boyunca aynı varyantta kalır. */
export function bildirimCopyVaryanti(talep: Pick<Talep, "id">, cekici: Pick<Cekici, "id">): BildirimCopyVaryanti {
  if (!bildirimCopyDeneyiAcikMi()) return "control";
  const hash = createHash("sha256").update(`${talep.id}:${cekici.id}:notification-copy-v1`).digest()[0];
  return hash % 2 === 0 ? "control" : "urgency_context";
}

export function talepYasiDakika(talep: Pick<Talep, "olusturulma">, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(talep.olusturulma).getTime()) / 60_000));
}
