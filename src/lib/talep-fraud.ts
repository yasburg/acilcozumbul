import { getSupabaseAdmin } from "./supabase/admin";
import { telefonNormalize } from "./telefon";

function envInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

const TELEFON_LIMIT = () => envInt("TALEP_FRAUD_TELEFON_LIMIT", 2);
const TELEFON_SAAT = () => envInt("TALEP_FRAUD_TELEFON_PENCERE_SAAT", 24);
const IP_LIMIT = () => envInt("TALEP_FRAUD_IP_LIMIT", 10);
const IP_SAAT = () => envInt("TALEP_FRAUD_IP_PENCERE_SAAT", 1);
const OTP_IP_LIMIT = () => envInt("OTP_FRAUD_IP_LIMIT", 8);
const OTP_IP_DK = () => envInt("OTP_FRAUD_IP_PENCERE_DK", 60);

function pencereBaslangic(dakika: number): string {
  return new Date(Date.now() - dakika * 60 * 1000).toISOString();
}

async function guvenlikSay(
  anahtar: string,
  olayTipi: string,
  dakika: number
): Promise<number> {
  const sb = getSupabaseAdmin();
  const { count, error } = await sb
    .from("guvenlik_olaylari")
    .select("*", { count: "exact", head: true })
    .eq("anahtar", anahtar)
    .eq("olay_tipi", olayTipi)
    .gte("olusturulma", pencereBaslangic(dakika));
  if (error) {
    if (error.code === "42P01") return 0;
    throw error;
  }
  return count ?? 0;
}

async function telefonTalepSay(telefon: string, saat: number): Promise<number> {
  const tel = telefonNormalize(telefon);
  const sb = getSupabaseAdmin();
  const { count, error } = await sb
    .from("talepler")
    .select("*", { count: "exact", head: true })
    .eq("telefon", tel)
    .gte("olusturulma", pencereBaslangic(saat * 60));
  if (error) throw error;
  return count ?? 0;
}

export async function guvenlikOlayiKaydet(input: {
  anahtar: string;
  olayTipi: "otp_gonder" | "talep_olustur";
  ipHash?: string | null;
  telefon?: string | null;
}): Promise<void> {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("guvenlik_olaylari").insert({
    anahtar: input.anahtar,
    olay_tipi: input.olayTipi,
    ip_hash: input.ipHash ?? null,
    telefon: input.telefon ? telefonNormalize(input.telefon) : null,
  });
  if (error && error.code !== "42P01") {
    console.error("[guvenlik_olaylari]", error.message);
  }
}

export async function otpFraudKontrol(ipHashDeger: string | null): Promise<
  | { ok: true }
  | { ok: false; hata: string }
> {
  if (!ipHashDeger) return { ok: true };
  const say = await guvenlikSay(`ip:${ipHashDeger}`, "otp_gonder", OTP_IP_DK());
  if (say >= OTP_IP_LIMIT()) {
    return {
      ok: false,
      hata: `Çok fazla doğrulama denemesi. ${OTP_IP_DK()} dakika sonra tekrar deneyin.`,
    };
  }
  return { ok: true };
}

export async function talepFraudKontrol(
  telefon: string | null | undefined,
  ipHashDeger: string | null
): Promise<{ ok: true } | { ok: false; hata: string }> {
  const telHam = telefon?.trim() ?? "";
  if (telHam) {
    const tel = telefonNormalize(telHam);
    if (/^05[0-9]{9}$/.test(tel)) {
      const telSay = await telefonTalepSay(tel, TELEFON_SAAT());
      if (telSay >= TELEFON_LIMIT()) {
        return {
          ok: false,
          hata: `Bu telefon numarasıyla son ${TELEFON_SAAT()} saatte en fazla ${TELEFON_LIMIT()} talep açılabilir.`,
        };
      }
    }
  }

  if (ipHashDeger) {
    const ipSay = await guvenlikSay(
      `ip:${ipHashDeger}`,
      "talep_olustur",
      IP_SAAT() * 60
    );
    if (ipSay >= IP_LIMIT()) {
      return {
        ok: false,
        hata: `Kısa sürede çok fazla talep denemesi. Lütfen ${IP_SAAT()} saat sonra tekrar deneyin.`,
      };
    }
  }

  return { ok: true };
}
