import { getCekiciById } from "./db";
import { getKrediOdemeById, kaydetKrediOdeme } from "./kredi-odeme";
import { ROZET_INDIRIMLI_FIYAT_TL, ROZET_LISTE_FIYAT_TL } from "./rozet";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import { odemeFromRow, type OdemeRow } from "./supabase/mappers";
import type { KrediOdeme } from "./types";

/**
 * Eski rozet ödemeleri tamamla sırasında kredi_odemeler’e yazılmıyordu.
 * Tamamlanmış odeme_bekleyen rozet kayıtlarını idempotent olarak aktarır.
 */
export async function senkronizeTamamlananRozetOdemeleri(): Promise<{
  aktarilan: number;
}> {
  if (!supabaseDbAktif()) return { aktarilan: 0 };

  const { data, error } = await getSupabaseAdmin()
    .from("odeme_bekleyen")
    .select("*")
    .eq("odeme_tipi", "rozet")
    .eq("durum", "tamamlandi")
    .order("olusturulma", { ascending: false })
    .limit(500);
  if (error) throw error;

  let aktarilan = 0;
  for (const row of data ?? []) {
    const bekleyen = odemeFromRow(row as OdemeRow);
    const mevcut = await getKrediOdemeById(bekleyen.id);
    if (mevcut) continue;

    const cekici = await getCekiciById(bekleyen.cekiciId);
    if (!cekici) continue;

    const kayit: KrediOdeme = {
      id: bekleyen.id,
      cekiciId: cekici.id,
      cekiciAd: cekici.ad,
      cekiciTelefon: cekici.telefon,
      miktar: 0,
      tutar: Number(bekleyen.tutar) || ROZET_INDIRIMLI_FIYAT_TL,
      listeFiyati: bekleyen.listeFiyati ?? ROZET_LISTE_FIYAT_TL,
      paketTl:
        bekleyen.paketTl ??
        bekleyen.listeFiyati ??
        (Number(bekleyen.tutar) || ROZET_INDIRIMLI_FIYAT_TL),
      odemeTipi: "rozet",
      faturaEposta:
        bekleyen.faturaEposta || cekici.faturaEposta || "",
      faturaAdres: bekleyen.faturaAdres,
      faturaTcKimlik: bekleyen.faturaTcKimlik,
      kurumsal: Boolean(bekleyen.kurumsal),
      sirketUnvan: bekleyen.sirketUnvan,
      vergiNo: bekleyen.vergiNo,
      demoOdeme: false,
      olusturulma:
        cekici.rozetOdemeTarihi ||
        bekleyen.olusturulma ||
        new Date().toISOString(),
    };

    try {
      await kaydetKrediOdeme(kayit);
      aktarilan += 1;
    } catch (e) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code?: string }).code)
          : "";
      if (code === "23505") continue;
      throw e;
    }
  }

  return { aktarilan };
}
