import { randomBytes } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";

export const SMS_TALEP_KISA_TOKEN_LEN = 8;
export const SMS_TALEP_KISA_TOKEN_ALFABE =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const MAX_DENEME = 8;

export type SmsTalepKisaLinkKayit = {
  token: string;
  talepId: string;
  cekiciId: string;
  cekiciToken: string;
  olusturulma: string;
  ilkTiklama: string | null;
  tiklamaSayisi: number;
};

/** Test / DB kapalı ortam için bellek deposu */
const bellek = new Map<string, SmsTalepKisaLinkKayit>();
const bellekTalepCekici = new Map<string, string>();

let tabloVar: boolean | null = null;

export function smsTalepKisaTokenGecerliMi(token: string): boolean {
  return new RegExp(
    `^[0-9A-Za-z]{${SMS_TALEP_KISA_TOKEN_LEN}}$`
  ).test(token);
}

export function smsTalepKisaTokenUret(): string {
  const bytes = randomBytes(SMS_TALEP_KISA_TOKEN_LEN);
  let out = "";
  for (let i = 0; i < SMS_TALEP_KISA_TOKEN_LEN; i++) {
    out += SMS_TALEP_KISA_TOKEN_ALFABE[bytes[i]! % SMS_TALEP_KISA_TOKEN_ALFABE.length]!;
  }
  return out;
}

export function smsTalepKisaPath(token: string): string {
  return `/t/${token}`;
}

export function smsTalepKisaUrl(token: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${smsTalepKisaPath(token)}`;
}

export function smsTalepUzunPath(talepId: string): string {
  return `/cekici/talep/${talepId}`;
}

export function smsTalepUzunUrl(talepId: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}${smsTalepUzunPath(talepId)}`;
}

async function smsTalepKisaTabloVar(): Promise<boolean> {
  if (tabloVar !== null) return tabloVar;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("sms_talep_kisa_link")
    .select("token")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

function bellekAnahtar(talepId: string, cekiciId: string): string {
  return `${talepId}::${cekiciId}`;
}

function bellekKaydet(kayit: SmsTalepKisaLinkKayit): void {
  bellek.set(kayit.token, kayit);
  bellekTalepCekici.set(bellekAnahtar(kayit.talepId, kayit.cekiciId), kayit.token);
}

function rowToKayit(row: Record<string, unknown>): SmsTalepKisaLinkKayit {
  return {
    token: String(row.token),
    talepId: String(row.talep_id),
    cekiciId: String(row.cekici_id),
    cekiciToken: String(row.cekici_token),
    olusturulma: String(row.olusturulma),
    ilkTiklama: row.ilk_tiklama ? String(row.ilk_tiklama) : null,
    tiklamaSayisi: Number(row.tiklama_sayisi ?? 0),
  };
}

/** Aynı talep+çekici için mevcut kısa kodu döner veya yenisini üretir */
export async function olusturSmsTalepKisaLink(opts: {
  talepId: string;
  cekiciId: string;
  cekiciToken: string;
}): Promise<SmsTalepKisaLinkKayit> {
  const talepId = opts.talepId.trim();
  const cekiciId = opts.cekiciId.trim();
  const cekiciToken = opts.cekiciToken.trim();
  if (!talepId || !cekiciId || !cekiciToken) {
    throw new Error("Kısa link için talep/çekici bilgisi eksik.");
  }

  if (!(await smsTalepKisaTabloVar())) {
    const mevcutToken = bellekTalepCekici.get(bellekAnahtar(talepId, cekiciId));
    if (mevcutToken) {
      const mevcut = bellek.get(mevcutToken);
      if (mevcut && mevcut.cekiciToken === cekiciToken) return mevcut;
    }
    for (let i = 0; i < MAX_DENEME; i++) {
      const token = smsTalepKisaTokenUret();
      if (bellek.has(token)) continue;
      const kayit: SmsTalepKisaLinkKayit = {
        token,
        talepId,
        cekiciId,
        cekiciToken,
        olusturulma: new Date().toISOString(),
        ilkTiklama: null,
        tiklamaSayisi: 0,
      };
      bellekKaydet(kayit);
      return kayit;
    }
    throw new Error("Benzersiz kısa link üretilemedi.");
  }

  const sb = getSupabaseAdmin();
  const { data: mevcut } = await sb
    .from("sms_talep_kisa_link")
    .select(
      "token, talep_id, cekici_id, cekici_token, olusturulma, ilk_tiklama, tiklama_sayisi"
    )
    .eq("talep_id", talepId)
    .eq("cekici_id", cekiciId)
    .maybeSingle();

  if (mevcut) {
    const kayit = rowToKayit(mevcut as Record<string, unknown>);
    if (kayit.cekiciToken !== cekiciToken) {
      const { data: guncel, error } = await sb
        .from("sms_talep_kisa_link")
        .update({ cekici_token: cekiciToken })
        .eq("token", kayit.token)
        .select(
          "token, talep_id, cekici_id, cekici_token, olusturulma, ilk_tiklama, tiklama_sayisi"
        )
        .single();
      if (!error && guncel) return rowToKayit(guncel as Record<string, unknown>);
    }
    return kayit;
  }

  for (let i = 0; i < MAX_DENEME; i++) {
    const token = smsTalepKisaTokenUret();
    const { data, error } = await sb
      .from("sms_talep_kisa_link")
      .insert({
        token,
        talep_id: talepId,
        cekici_id: cekiciId,
        cekici_token: cekiciToken,
      })
      .select(
        "token, talep_id, cekici_id, cekici_token, olusturulma, ilk_tiklama, tiklama_sayisi"
      )
      .single();

    if (!error && data) return rowToKayit(data as Record<string, unknown>);

    const duplicate =
      error?.code === "23505" ||
      String(error?.message ?? "").toLowerCase().includes("duplicate");
    if (!duplicate) throw error ?? new Error("Kısa link kaydı başarısız.");

    /* talep+çekici çakışması — yeniden oku */
    const { data: tekrar } = await sb
      .from("sms_talep_kisa_link")
      .select(
        "token, talep_id, cekici_id, cekici_token, olusturulma, ilk_tiklama, tiklama_sayisi"
      )
      .eq("talep_id", talepId)
      .eq("cekici_id", cekiciId)
      .maybeSingle();
    if (tekrar) return rowToKayit(tekrar as Record<string, unknown>);
  }
  throw new Error("Benzersiz kısa link üretilemedi.");
}

export async function getSmsTalepKisaLink(
  token: string
): Promise<SmsTalepKisaLinkKayit | null> {
  if (!smsTalepKisaTokenGecerliMi(token)) return null;

  if (!(await smsTalepKisaTabloVar())) {
    return bellek.get(token) ?? null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("sms_talep_kisa_link")
    .select(
      "token, talep_id, cekici_id, cekici_token, olusturulma, ilk_tiklama, tiklama_sayisi"
    )
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToKayit(data as Record<string, unknown>);
}

export async function kaydetSmsTalepKisaLinkTiklama(
  token: string
): Promise<boolean> {
  const kayit = await getSmsTalepKisaLink(token);
  if (!kayit) return false;
  const now = new Date().toISOString();

  if (!(await smsTalepKisaTabloVar())) {
    bellekKaydet({
      ...kayit,
      tiklamaSayisi: kayit.tiklamaSayisi + 1,
      ilkTiklama: kayit.ilkTiklama ?? now,
    });
    return true;
  }

  const { error } = await getSupabaseAdmin()
    .from("sms_talep_kisa_link")
    .update({
      tiklama_sayisi: kayit.tiklamaSayisi + 1,
      ilk_tiklama: kayit.ilkTiklama ?? now,
    })
    .eq("token", token);
  if (error) {
    console.error("[sms-talep-kisa] tıklama", error.message);
    return false;
  }
  return true;
}

/** Testler için bellek deposunu temizle */
export function smsTalepKisaLinkBellekTemizle(): void {
  bellek.clear();
  bellekTalepCekici.clear();
  tabloVar = null;
}
