import { randomUUID } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  carkOdulSmsMi,
  carkScriptliDilimIndex,
  carkDilimSonuc,
  type CarkOdulSms,
} from "./kayit-cark";
import { telefonNormalize } from "./telefon";

let tabloVar: boolean | null = null;

/** DB yokken geliştirme / fallback */
const bellekOduller = new Map<
  string,
  {
    rewardSms: CarkOdulSms;
    status: "pending" | "claimed";
    telefon?: string;
    cekiciId?: string;
  }
>();
const bellekTelefonClaim = new Set<string>();

export async function kayitCarkTablosuVar(): Promise<boolean> {
  if (tabloVar === true) return true;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("kayit_cark_odul")
    .select("id")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

export type CarkSpinSonuc =
  | { tip: "tekrar"; dilimIndex: number }
  | {
      tip: "odul";
      dilimIndex: number;
      rewardSms: CarkOdulSms;
      token: string;
    };

export async function kayitCarkSpin(opts?: {
  deneme?: number;
}): Promise<CarkSpinSonuc> {
  const deneme = opts?.deneme === 2 ? 2 : 1;
  const dilimIndex = carkScriptliDilimIndex(deneme);
  const dilim = carkDilimSonuc(dilimIndex);
  if (dilim.tip === "tekrar") {
    return { tip: "tekrar", dilimIndex };
  }

  const rewardSms = dilim.tip;
  const token = randomUUID().replace(/-/g, "");

  if (await kayitCarkTablosuVar()) {
    const { error } = await getSupabaseAdmin().from("kayit_cark_odul").insert({
      id: randomUUID(),
      token,
      reward_sms: rewardSms,
      status: "pending",
      olusturulma: new Date().toISOString(),
    });
    if (error) {
      console.error("[kayit-cark] spin insert", error.message);
      bellekOduller.set(token, { rewardSms, status: "pending" });
    }
  } else {
    bellekOduller.set(token, { rewardSms, status: "pending" });
  }

  return { tip: "odul", dilimIndex, rewardSms, token };
}

/**
 * OTP sonrası: token + telefon ile ödülü bir kez yükle.
 */
export async function kayitCarkOdulTalepEt(opts: {
  token: string;
  telefon: string;
  cekiciId: string;
}): Promise<{ ok: true; rewardSms: CarkOdulSms } | { ok: false; hata: string }> {
  const token = opts.token.trim();
  if (!token || token.length < 16) {
    return { ok: false, hata: "Geçersiz çark token." };
  }
  const tel = telefonNormalize(opts.telefon);

  if (await kayitCarkTablosuVar()) {
    const db = getSupabaseAdmin();

    const { data: telClaim } = await db
      .from("kayit_cark_odul")
      .select("id")
      .eq("telefon", tel)
      .eq("status", "claimed")
      .limit(1)
      .maybeSingle();
    if (telClaim) {
      return {
        ok: false,
        hata: "Bu telefon için çark ödülü daha önce kullanıldı.",
      };
    }

    const { data: row, error } = await db
      .from("kayit_cark_odul")
      .select("id, reward_sms, status")
      .eq("token", token)
      .maybeSingle();

    if (error || !row) {
      /* DB insert başarısız olduysa bellek fallback */
      return bellekClaim(token, tel, opts.cekiciId);
    }
    if (row.status === "claimed") {
      return { ok: false, hata: "Ödül zaten kullanıldı." };
    }
    if (row.status !== "pending") {
      return { ok: false, hata: "Ödül geçersiz." };
    }
    const rewardSms = Number(row.reward_sms);
    if (!carkOdulSmsMi(rewardSms)) {
      return { ok: false, hata: "Ödül miktarı geçersiz." };
    }

    const { error: upErr } = await db
      .from("kayit_cark_odul")
      .update({
        status: "claimed",
        telefon: tel,
        cekici_id: opts.cekiciId,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("status", "pending");

    if (upErr) {
      console.error("[kayit-cark] claim", upErr.message);
      return { ok: false, hata: "Ödül yüklenemedi." };
    }

    return { ok: true, rewardSms };
  }

  return bellekClaim(token, tel, opts.cekiciId);
}

function bellekClaim(
  token: string,
  tel: string,
  cekiciId: string
): { ok: true; rewardSms: CarkOdulSms } | { ok: false; hata: string } {
  if (bellekTelefonClaim.has(tel)) {
    return {
      ok: false,
      hata: "Bu telefon için çark ödülü daha önce kullanıldı.",
    };
  }
  const bellek = bellekOduller.get(token);
  if (!bellek) return { ok: false, hata: "Çark ödülü bulunamadı." };
  if (bellek.status === "claimed") {
    return { ok: false, hata: "Ödül zaten kullanıldı." };
  }
  bellek.status = "claimed";
  bellek.telefon = tel;
  bellek.cekiciId = cekiciId;
  bellekTelefonClaim.add(tel);
  return { ok: true, rewardSms: bellek.rewardSms };
}
