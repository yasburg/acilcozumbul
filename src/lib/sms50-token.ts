import { randomBytes } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  SMS50_KAMPANYA_KODU,
  SMS50_TOKEN_ALFABE,
  SMS50_TOKEN_LEN,
  sms50TokenGecerliMi,
  sms50VaryantMi,
  type Sms50Varyant,
} from "./sms50-kampanya";
import { telefonNormalize } from "./telefon";

let tokenTabloVar: boolean | null = null;

export async function smsKampanyaTokenTablosuVar(): Promise<boolean> {
  if (tokenTabloVar !== null) return tokenTabloVar;
  if (!supabaseDbAktif()) {
    tokenTabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_link_token")
    .select("token")
    .limit(1);
  tokenTabloVar = !error;
  return tokenTabloVar;
}

export function sms50TokenUret(): string {
  const bytes = randomBytes(SMS50_TOKEN_LEN);
  let out = "";
  for (let i = 0; i < SMS50_TOKEN_LEN; i++) {
    out += SMS50_TOKEN_ALFABE[bytes[i]! % SMS50_TOKEN_ALFABE.length]!;
  }
  return out;
}

export type Sms50TokenKayit = {
  token: string;
  varyant: Sms50Varyant;
  kampanyaKodu: string;
  telefon: string;
  isId: string | null;
  listeId: string | null;
  olusturulma: string;
  ilkTiklama: string | null;
  tiklamaSayisi: number;
  kayitAt: string | null;
  kayitCekiciId: string | null;
};

function rowToKayit(r: Record<string, unknown>): Sms50TokenKayit {
  return {
    token: String(r.token),
    varyant: String(r.varyant) as Sms50Varyant,
    kampanyaKodu: String(r.kampanya_kodu ?? SMS50_KAMPANYA_KODU),
    telefon: String(r.telefon),
    isId: r.is_id ? String(r.is_id) : null,
    listeId: r.liste_id ? String(r.liste_id) : null,
    olusturulma: String(r.olusturulma),
    ilkTiklama: r.ilk_tiklama ? String(r.ilk_tiklama) : null,
    tiklamaSayisi: Number(r.tiklama_sayisi) || 0,
    kayitAt: r.kayit_at ? String(r.kayit_at) : null,
    kayitCekiciId: r.kayit_cekici_id ? String(r.kayit_cekici_id) : null,
  };
}

const MAX_DENEME = 8;

/** Rastgele token üretip DB’ye yazar; çakışmada yeniden dener */
export async function olusturSms50LinkToken(opts: {
  varyant: Sms50Varyant;
  telefon: string;
  kampanyaKodu?: string;
  isId?: string | null;
  listeId?: string | null;
}): Promise<Sms50TokenKayit> {
  if (!(await smsKampanyaTokenTablosuVar())) {
    throw new Error(
      "sms_kampanya_link_token yok. supabase/migrations/035_sms50_kisi_token.sql çalıştırın."
    );
  }
  const telefon = telefonNormalize(opts.telefon);
  const kampanyaKodu = opts.kampanyaKodu?.trim() || SMS50_KAMPANYA_KODU;
  const sb = getSupabaseAdmin();

  for (let i = 0; i < MAX_DENEME; i++) {
    const token = sms50TokenUret();
    const { data, error } = await sb
      .from("sms_kampanya_link_token")
      .insert({
        token,
        varyant: opts.varyant,
        kampanya_kodu: kampanyaKodu,
        telefon,
        is_id: opts.isId ?? null,
        liste_id: opts.listeId ?? null,
      })
      .select(
        "token, varyant, kampanya_kodu, telefon, is_id, liste_id, olusturulma, ilk_tiklama, tiklama_sayisi, kayit_at, kayit_cekici_id"
      )
      .single();

    if (!error && data) return rowToKayit(data as Record<string, unknown>);

    const duplicate =
      error?.code === "23505" ||
      String(error?.message ?? "").toLowerCase().includes("duplicate");
    if (!duplicate) throw error ?? new Error("Token kaydı başarısız.");
  }
  throw new Error("Benzersiz token üretilemedi.");
}

export async function getSms50LinkToken(
  token: string
): Promise<Sms50TokenKayit | null> {
  if (!sms50TokenGecerliMi(token)) return null;
  if (!(await smsKampanyaTokenTablosuVar())) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("sms_kampanya_link_token")
    .select(
      "token, varyant, kampanya_kodu, telefon, is_id, liste_id, olusturulma, ilk_tiklama, tiklama_sayisi, kayit_at, kayit_cekici_id"
    )
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (!sms50VaryantMi(String(data.varyant))) return null;
  return rowToKayit(data as Record<string, unknown>);
}

export async function kaydetSms50TokenTiklama(token: string): Promise<boolean> {
  const kayit = await getSms50LinkToken(token);
  if (!kayit) return false;
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_link_token")
    .update({
      tiklama_sayisi: kayit.tiklamaSayisi + 1,
      ilk_tiklama: kayit.ilkTiklama ?? now,
    })
    .eq("token", token);
  if (error) {
    console.error("[sms50-token] tıklama", error.message);
    return false;
  }
  return true;
}

export async function baglaSms50TokenKayit(opts: {
  token: string;
  cekiciId: string;
}): Promise<void> {
  if (!sms50TokenGecerliMi(opts.token)) return;
  if (!(await smsKampanyaTokenTablosuVar())) return;
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_link_token")
    .update({
      kayit_at: new Date().toISOString(),
      kayit_cekici_id: opts.cekiciId,
    })
    .eq("token", opts.token)
    .is("kayit_at", null);
  if (error) {
    console.error("[sms50-token] kayıt bağlama", error.message);
  }
}

/** Telefon → en son token özeti (genel liste için) */
export async function getSms50TokenOzetByTelefonlar(
  telefonlar: string[]
): Promise<
  Map<
    string,
    {
      linkActi: boolean;
      ilkTiklama: string | null;
      kayitAt: string | null;
      kayitCekiciId: string | null;
      varyant: string | null;
    }
  >
> {
  const out = new Map<
    string,
    {
      linkActi: boolean;
      ilkTiklama: string | null;
      kayitAt: string | null;
      kayitCekiciId: string | null;
      varyant: string | null;
    }
  >();
  if (telefonlar.length === 0) return out;
  if (!(await smsKampanyaTokenTablosuVar())) return out;

  const benzersiz = [...new Set(telefonlar.map((t) => telefonNormalize(t)))];
  const sb = getSupabaseAdmin();
  const CHUNK = 200;
  for (let i = 0; i < benzersiz.length; i += CHUNK) {
    const parti = benzersiz.slice(i, i + CHUNK);
    const { data, error } = await sb
      .from("sms_kampanya_link_token")
      .select(
        "telefon, varyant, ilk_tiklama, tiklama_sayisi, kayit_at, kayit_cekici_id, olusturulma"
      )
      .in("telefon", parti)
      .order("olusturulma", { ascending: false });
    if (error) throw error;
    for (const row of data ?? []) {
      const tel = String(row.telefon);
      if (out.has(tel)) continue; /* en yeni */
      out.set(tel, {
        linkActi: (Number(row.tiklama_sayisi) || 0) > 0,
        ilkTiklama: row.ilk_tiklama ? String(row.ilk_tiklama) : null,
        kayitAt: row.kayit_at ? String(row.kayit_at) : null,
        kayitCekiciId: row.kayit_cekici_id
          ? String(row.kayit_cekici_id)
          : null,
        varyant: row.varyant ? String(row.varyant) : null,
      });
    }
  }
  return out;
}
