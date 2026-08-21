import { aracDurumuEtiket } from "./arac-durumu";
import { aracTipiEtiket } from "./arac-tipi";
import { kilitDurumuEtiket } from "./kilit-durumu";
import { lastikDurumuEtiket } from "./lastik-durumu";
import {
  sorunHedefKonumGerekliMi,
  sorunKilitDurumuGerekliMi,
  sorunLastikDurumuGerekliMi,
  sorunTipiBul,
  sorunYakitTipiGerekliMi,
} from "./sorun-tipleri";
import { yakitTipiEtiket } from "./yakit-tipi";
import { sesliTalepDogrula, type SesliKonum, type SesliTalepGirdi } from "./fish-audio-talep";

export type SesliOzetAlani = {
  id: string;
  label: string;
  deger: string;
  zorunlu: boolean;
  tamam: boolean;
};

function etiketVeyaId(
  id: string | undefined,
  etiket: (v: string) => string | null
): string {
  const ham = id?.trim() ?? "";
  if (!ham) return "";
  return etiket(ham) ?? ham;
}

export function sesliOzetAlanlari(
  girdi: SesliTalepGirdi,
  konum: SesliKonum | null
): SesliOzetAlani[] {
  const tip = girdi.sorunTipi;
  const adres = konum?.adres?.trim() || girdi.adres?.trim() || "";
  const hedefGerekli = sorunHedefKonumGerekliMi(tip);
  const hedefTamam = Boolean(
    girdi.hedefBilinmiyor || girdi.hedefAdres?.trim()
  );

  const alanlar: SesliOzetAlani[] = [
    {
      id: "konum",
      label: "Konum",
      deger: adres,
      zorunlu: true,
      tamam: adres.length > 0,
    },
    {
      id: "sorun_tipi",
      label: "Sorun",
      deger: tip ? sorunTipiBul(tip)?.label ?? tip : "",
      zorunlu: true,
      tamam: Boolean(tip),
    },
  ];

  if (tip === "diger" || girdi.sorunDetay?.trim()) {
    alanlar.push({
      id: "sorun_detay",
      label: "Detay",
      deger: girdi.sorunDetay?.trim() ?? "",
      zorunlu: tip === "diger",
      tamam: Boolean(girdi.sorunDetay?.trim()),
    });
  }

  if (tip && sorunLastikDurumuGerekliMi(tip)) {
    alanlar.push({
      id: "lastik_durumu",
      label: "Lastik",
      deger: etiketVeyaId(girdi.lastikDurumu, lastikDurumuEtiket),
      zorunlu: true,
      tamam: Boolean(girdi.lastikDurumu),
    });
  }
  if (tip && sorunYakitTipiGerekliMi(tip)) {
    alanlar.push({
      id: "yakit_tipi",
      label: "Yakıt",
      deger: etiketVeyaId(girdi.yakitTipi, yakitTipiEtiket),
      zorunlu: true,
      tamam: Boolean(girdi.yakitTipi),
    });
  }
  if (tip && sorunKilitDurumuGerekliMi(tip)) {
    alanlar.push({
      id: "kilit_durumu",
      label: "Kilit",
      deger: etiketVeyaId(girdi.kilitDurumu, kilitDurumuEtiket),
      zorunlu: true,
      tamam: Boolean(girdi.kilitDurumu),
    });
  }

  if (tip && hedefGerekli) {
    alanlar.push({
      id: "hedef",
      label: "Hedef",
      deger: girdi.hedefBilinmiyor
        ? "Henüz bilinmiyor"
        : girdi.hedefAdres?.trim() ?? "",
      zorunlu: true,
      tamam: hedefTamam,
    });
  }

  alanlar.push(
    {
      id: "arac_tipi",
      label: "Araç tipi",
      deger: etiketVeyaId(girdi.aracTipi, aracTipiEtiket),
      zorunlu: false,
      tamam: Boolean(girdi.aracTipi),
    },
    {
      id: "arac_durumu",
      label: "Araç durumu",
      deger: etiketVeyaId(girdi.aracDurumu, aracDurumuEtiket),
      zorunlu: false,
      tamam: Boolean(girdi.aracDurumu),
    }
  );

  return alanlar;
}

export function sesliOzetHazirMi(
  girdi: SesliTalepGirdi,
  konum: SesliKonum | null
): boolean {
  return sesliTalepDogrula(girdi, konum) === null;
}
