import { smsBaseUrl } from "./sms-base-url";
import { simulasyonCalistir } from "./simulasyon-ihale-db";
import { topluMemnuniyetSmsGonder } from "./memnuniyet";
import { isleIhaleHatirlatmalari } from "./ihale-hatirlatma-db";
import {
  tetikleTopluSmsKuyruk,
} from "./toplu-sms-is-db";
import { topluSmsIsTablolariVar } from "./supabase/toplu-sms-schema";

function hataMetni(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === "string") return m;
  }
  return String(e);
}

/**
 * 5 dakikalık Railway cron'unun yaptığı işler (simülasyon + eksik SMS cron'ları).
 */
export async function cronPeriyodikCalistir(opts: {
  baseUrl: string;
}): Promise<{
  sim: Awaited<ReturnType<typeof simulasyonCalistir>>;
  memnuniyet: number;
  ihale: Awaited<ReturnType<typeof isleIhaleHatirlatmalari>> | null;
  topluSms: Awaited<ReturnType<typeof tetikleTopluSmsKuyruk>> | null;
  hatalar: string[];
}> {
  const baseUrl = smsBaseUrl(opts.baseUrl);
  const hatalar: string[] = [];

  let sim: Awaited<ReturnType<typeof simulasyonCalistir>> = {
    acilan: 0,
    kapanan: 0,
    hatalar: [],
  };
  try {
    sim = await simulasyonCalistir({ baseUrl });
  } catch (e) {
    hatalar.push(`sim:${hataMetni(e)}`);
  }

  let memnuniyet = 0;
  try {
    memnuniyet = await topluMemnuniyetSmsGonder(baseUrl);
  } catch (e) {
    hatalar.push(`memnuniyet:${hataMetni(e)}`);
  }

  let ihale: Awaited<ReturnType<typeof isleIhaleHatirlatmalari>> | null = null;
  try {
    ihale = await isleIhaleHatirlatmalari(baseUrl);
  } catch (e) {
    hatalar.push(`ihale:${hataMetni(e)}`);
  }

  let topluSms: Awaited<ReturnType<typeof tetikleTopluSmsKuyruk>> | null = null;
  try {
    if (await topluSmsIsTablolariVar()) {
      topluSms = await tetikleTopluSmsKuyruk();
    }
  } catch (e) {
    hatalar.push(`toplu-sms:${hataMetni(e)}`);
  }

  return { sim, memnuniyet, ihale, topluSms, hatalar };
}
