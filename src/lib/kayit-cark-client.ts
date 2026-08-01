"use client";

import type { CarkOdulSms } from "./kayit-cark";
import { carkOdulSmsMi } from "./kayit-cark";

const KEY_REWARD = "kayit_cark_reward_sms";
const KEY_TOKEN = "kayit_cark_token";
const KEY_STATUS = "kayit_cark_status";
const KEY_AUTO = "kayit_cark_auto_opened";
const KEY_DISMISS = "kayit_cark_dismissed";
const KEY_COMPLETED = "kayit_cark_completed";
const KEY_SPIN_SAYISI = "kayit_cark_spin_sayisi";

export type CarkOdulDurum = "pending" | "claimed" | null;

function okuma(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function yaz(key: string, val: string): void {
  try {
    sessionStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

export function carkAutoOpenedMi(): boolean {
  return okuma(KEY_AUTO) === "1";
}

export function carkAutoOpenedIsaretle(): void {
  yaz(KEY_AUTO, "1");
}

export function carkDismissedMi(): boolean {
  return okuma(KEY_DISMISS) === "1";
}

export function carkDismissedIsaretle(): void {
  yaz(KEY_DISMISS, "1");
}

export function carkCompletedMi(): boolean {
  return okuma(KEY_COMPLETED) === "1";
}

/** Sonraki spin deneme no: 1 (ilk) veya 2 (tekrar sonrası) */
export function carkSonrakiDeneme(): 1 | 2 {
  const n = Number(okuma(KEY_SPIN_SAYISI) ?? "0");
  return n >= 1 ? 2 : 1;
}

export function carkSpinSayisiArttir(): void {
  const n = Number(okuma(KEY_SPIN_SAYISI) ?? "0");
  yaz(KEY_SPIN_SAYISI, String(Math.min(2, Math.max(0, n) + 1)));
}

export function carkOdulSakla(opts: {
  rewardSms: CarkOdulSms;
  token: string;
}): void {
  yaz(KEY_REWARD, String(opts.rewardSms));
  yaz(KEY_TOKEN, opts.token);
  yaz(KEY_STATUS, "pending");
  yaz(KEY_COMPLETED, "1");
}

export function carkOdulOku(): {
  rewardSms: CarkOdulSms;
  token: string;
  status: CarkOdulDurum;
} | null {
  const smsHam = okuma(KEY_REWARD);
  const token = okuma(KEY_TOKEN);
  const status = okuma(KEY_STATUS) as CarkOdulDurum;
  const sms = smsHam ? Number(smsHam) : NaN;
  if (!carkOdulSmsMi(sms) || !token) return null;
  return { rewardSms: sms, token, status };
}

export function carkOdulTemizle(): void {
  try {
    sessionStorage.removeItem(KEY_REWARD);
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_STATUS);
    sessionStorage.removeItem(KEY_COMPLETED);
    sessionStorage.removeItem(KEY_AUTO);
    sessionStorage.removeItem(KEY_DISMISS);
    sessionStorage.removeItem(KEY_SPIN_SAYISI);
  } catch {
    /* ignore */
  }
}
