import {
  getCekiciByDavetKodu,
  getCekiciById,
  kaydetDavetKullanim,
  updateCekici,
} from "./db";
import {
  DAVET_EDEN_BONUS_KREDI,
  DAVETLI_BONUS_KREDI,
  davetKayitBaslangicKredisi,
  davetKoduGecerliMi,
} from "./davet-kodu";
import type { Cekici } from "./types";

export type DavetKayitSonuc =
  | { uygulandi: false }
  | {
      uygulandi: true;
      davetKodu: string;
      davetEden: Cekici;
      davetliKredi: number;
      davetEdenKredi: number;
    };

export async function davetKayitHazirla(
  davetKoduHam: string | undefined,
  yeniTelefon: string
): Promise<
  | { ok: true; davet: DavetKayitSonuc }
  | { ok: false; hata: string }
> {
  const ham = davetKoduHam?.trim();
  if (!ham) {
    return { ok: true, davet: { uygulandi: false } };
  }

  const dogrulama = davetKoduGecerliMi(ham);
  if (!dogrulama.ok || !dogrulama.kod) {
    return { ok: false, hata: dogrulama.hata ?? "Geçersiz davet kodu." };
  }

  const davetEden = await getCekiciByDavetKodu(dogrulama.kod);
  if (!davetEden || !davetEden.aktif) {
    return { ok: false, hata: "Davet kodu bulunamadı. Size verilen kodu kontrol edin." };
  }

  if (davetEden.telefon === yeniTelefon) {
    return { ok: false, hata: "Kendi davet kodunuzu kullanamazsınız." };
  }

  return {
    ok: true,
    davet: {
      uygulandi: true,
      davetKodu: dogrulama.kod,
      davetEden,
      davetliKredi: DAVETLI_BONUS_KREDI,
      davetEdenKredi: DAVET_EDEN_BONUS_KREDI,
    },
  };
}

export function davetKayitBaslangicKredisiFromSonuc(davet: DavetKayitSonuc): number {
  return davetKayitBaslangicKredisi(davet.uygulandi);
}

export async function davetKayitBonusTamamla(
  yeniCekiciId: string,
  davet: DavetKayitSonuc
): Promise<void> {
  if (!davet.uygulandi) return;

  const davetEden = await getCekiciById(davet.davetEden.id);
  if (!davetEden) return;

  await updateCekici({
    ...davetEden,
    kredi: davetEden.kredi + davet.davetEdenKredi,
  });

  await kaydetDavetKullanim({
    davetKodu: davet.davetKodu,
    davetEdenId: davet.davetEden.id,
    yeniCekiciId,
    davetliKredi: davet.davetliKredi,
    davetEdenKredi: davet.davetEdenKredi,
  });
}
