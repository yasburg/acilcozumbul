import { getKampanyaByKod, kaydetKampanyaKullanim } from "./kampanya-db";
import {
  kampanyaGecerliMi,
  kampanyaKoduGecerliMi,
  kampanyaKoduNormalize,
} from "./kampanya-kodu";
import {
  davetKayitBaslangicKredisiFromSonuc,
  davetKayitBonusTamamla,
  davetKayitHazirla,
  type DavetKayitSonuc,
} from "./davet-kayit";
import { DAVETLI_BONUS_KREDI, davetKoduGecerliMi } from "./davet-kodu";
import { getCekiciByDavetKodu } from "./db";
import { kampanyaKoduSutunuVar } from "./supabase/kampanya-schema";

export type KayitKoduTip = "kampanya" | "davet";

export type KayitKoduSonuc =
  | { uygulandi: false }
  | {
      uygulandi: true;
      tip: "kampanya";
      kod: string;
      yeniUyeKredi: number;
    }
  | {
      uygulandi: true;
      tip: "davet";
      kod: string;
      davet: DavetKayitSonuc & { uygulandi: true };
    };

export type KayitKoduDogrulaSonuc =
  | { gecerli: false; hata: string }
  | {
      gecerli: true;
      tip: KayitKoduTip;
      kod: string;
      bonus: number;
      mesaj: string;
    };

export async function kayitKoduDogrula(
  ham: string
): Promise<KayitKoduDogrulaSonuc> {
  const trimmed = ham.trim();
  if (!trimmed) {
    return { gecerli: false, hata: "Kod girin." };
  }

  const kampanyaDogrulama = kampanyaKoduGecerliMi(trimmed);
  if (kampanyaDogrulama.ok && kampanyaDogrulama.kod) {
    if (await kampanyaKoduSutunuVar()) {
      const kampanya = await getKampanyaByKod(kampanyaDogrulama.kod);
      if (kampanya) {
        const gecerli = kampanyaGecerliMi(kampanya);
        if (!gecerli.ok) return { gecerli: false, hata: gecerli.hata };
        return {
          gecerli: true,
          tip: "kampanya",
          kod: kampanya.kod,
          bonus: kampanya.yeniUyeKredi,
          mesaj: `Geçerli kampanya kodu — kayıt olunca ${kampanya.yeniUyeKredi} kredi hediye.`,
        };
      }
    }
  }

  const davetDogrulama = davetKoduGecerliMi(trimmed);
  if (!davetDogrulama.ok || !davetDogrulama.kod) {
    return {
      gecerli: false,
      hata: davetDogrulama.hata ?? "Geçersiz kod.",
    };
  }

  const davetEden = await getCekiciByDavetKodu(davetDogrulama.kod);
  if (!davetEden || !davetEden.aktif) {
    return {
      gecerli: false,
      hata: "Kod bulunamadı. Size verilen kodu veya davet linkini kontrol edin.",
    };
  }

  return {
    gecerli: true,
    tip: "davet",
    kod: davetDogrulama.kod,
    bonus: DAVETLI_BONUS_KREDI,
    mesaj: `Geçerli davet kodu — kayıt olunca ${DAVETLI_BONUS_KREDI} kredi hediye.`,
  };
}

export async function kayitKoduHazirla(
  kodHam: string | undefined,
  yeniTelefon: string
): Promise<{ ok: true; sonuc: KayitKoduSonuc } | { ok: false; hata: string }> {
  const ham = kodHam?.trim();
  if (!ham) {
    return { ok: true, sonuc: { uygulandi: false } };
  }

  const normalized = kampanyaKoduNormalize(ham);

  const kampanyaDogrulama = kampanyaKoduGecerliMi(normalized);
  if (kampanyaDogrulama.ok && kampanyaDogrulama.kod) {
    if (await kampanyaKoduSutunuVar()) {
      const kampanya = await getKampanyaByKod(kampanyaDogrulama.kod);
      if (kampanya) {
        const gecerli = kampanyaGecerliMi(kampanya);
        if (!gecerli.ok) {
          return { ok: false, hata: gecerli.hata };
        }
        return {
          ok: true,
          sonuc: {
            uygulandi: true,
            tip: "kampanya",
            kod: kampanya.kod,
            yeniUyeKredi: kampanya.yeniUyeKredi,
          },
        };
      }
    }
  }

  const davetHazir = await davetKayitHazirla(normalized, yeniTelefon);
  if (!davetHazir.ok) {
    return { ok: false, hata: davetHazir.hata };
  }
  if (!davetHazir.davet.uygulandi) {
    return {
      ok: false,
      hata: "Kod bulunamadı. Size verilen kodu veya davet linkini kontrol edin.",
    };
  }

  return {
    ok: true,
    sonuc: {
      uygulandi: true,
      tip: "davet",
      kod: davetHazir.davet.davetKodu,
      davet: davetHazir.davet,
    },
  };
}

export function kayitBaslangicKredisi(sonuc: KayitKoduSonuc): number {
  if (!sonuc.uygulandi) return 0;
  if (sonuc.tip === "kampanya") return sonuc.yeniUyeKredi;
  return davetKayitBaslangicKredisiFromSonuc(sonuc.davet);
}

export async function kayitKoduBonusTamamla(
  yeniCekiciId: string,
  sonuc: KayitKoduSonuc
): Promise<void> {
  if (!sonuc.uygulandi) return;

  if (sonuc.tip === "kampanya") {
    await kaydetKampanyaKullanim({
      kampanyaKodu: sonuc.kod,
      yeniCekiciId,
      verilenKredi: sonuc.yeniUyeKredi,
    });
    return;
  }

  await davetKayitBonusTamamla(yeniCekiciId, sonuc.davet);
}
