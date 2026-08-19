import { vergiNoGecerliMi } from "../eposta";
import { trendyolEfaturamYapilandirildi } from "./config";
import { trendyolEfaturamAccessTokenAl } from "./auth";
import { trendyolEfaturamConfigOku } from "./config";

export type EfaturaAliasTipi = "INVOICE" | "DESPATCH_ADVICE";

export type EfaturaMukellefKayit = {
  taxId: string;
  alias: string;
  title: string;
  gibUserType?: string;
  aliasType: EfaturaAliasTipi;
  deletedAt?: string | null;
};

export type FaturaBelgeTipi = "e-fatura" | "e-arsiv";

export type EfaturaMukellefSorguSonuc =
  | {
      ok: true;
      yapilandirildi: true;
      vergiNo: string;
      mukellef: boolean;
      unvan?: string;
      alias?: string;
      kayitlar: EfaturaMukellefKayit[];
    }
  | {
      ok: false;
      yapilandirildi: boolean;
      hata: string;
      vergiNo?: string;
    };

export function vergiNoNormalize(ham: string): string {
  return ham.replace(/\D/g, "");
}

/** Aktif e-fatura posta kutusu (INVOICE alias) var mı */
export function aktifEfaturaMukellefiMi(kayitlar: EfaturaMukellefKayit[]): boolean {
  return kayitlar.some((k) => k.aliasType === "INVOICE" && !k.deletedAt);
}

/** Kurumsal + mükellef → e-fatura; aksi halde e-arşiv */
export function faturaBelgeTipiBelirle(opts: {
  kurumsal: boolean;
  mukellef: boolean;
}): FaturaBelgeTipi {
  if (opts.kurumsal && opts.mukellef) return "e-fatura";
  return "e-arsiv";
}

export async function efaturaMukellefiSorgula(
  hamVergiNo: string,
  opts?: { showDeleted?: boolean }
): Promise<EfaturaMukellefSorguSonuc> {
  const vergiNo = vergiNoNormalize(hamVergiNo);
  if (!vergiNoGecerliMi(vergiNo)) {
    return {
      ok: false,
      yapilandirildi: trendyolEfaturamYapilandirildi(),
      hata: "Geçerli bir vergi numarası girin (10–11 hane).",
      vergiNo,
    };
  }

  if (!trendyolEfaturamYapilandirildi()) {
    return {
      ok: false,
      yapilandirildi: false,
      hata: "Trendyol E-Faturam yapılandırılmamış.",
      vergiNo,
    };
  }

  try {
    const accessToken = await trendyolEfaturamAccessTokenAl();
    const { apiBaseUrl } = trendyolEfaturamConfigOku();
    const params = new URLSearchParams();
    if (opts?.showDeleted) params.set("showDeleted", "true");
    const qs = params.toString();
    const url = `${apiBaseUrl}/api/invoice/taxpayers/${encodeURIComponent(vergiNo)}${qs ? `?${qs}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-access-token": accessToken,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 404) {
      return {
        ok: true,
        yapilandirildi: true,
        vergiNo,
        mukellef: false,
        kayitlar: [],
      };
    }

    if (!res.ok) {
      const metin = await res.text().catch(() => "");
      return {
        ok: false,
        yapilandirildi: true,
        vergiNo,
        hata: `Mükellef sorgusu başarısız (${res.status})${metin ? `: ${metin.slice(0, 200)}` : ""}`,
      };
    }

    const kayitlar = (await res.json()) as EfaturaMukellefKayit[];
    const liste = Array.isArray(kayitlar) ? kayitlar : [];
    const mukellef = aktifEfaturaMukellefiMi(liste);
    const birincil = liste.find(
      (k) => k.aliasType === "INVOICE" && !k.deletedAt
    );

    return {
      ok: true,
      yapilandirildi: true,
      vergiNo,
      mukellef,
      unvan: birincil?.title,
      alias: birincil?.alias,
      kayitlar: liste,
    };
  } catch (e) {
    return {
      ok: false,
      yapilandirildi: true,
      vergiNo,
      hata: e instanceof Error ? e.message : "Mükellef sorgusu başarısız.",
    };
  }
}
