import type { KrediOdeme } from "../types";
import { kurumsalFaturaPayloadOlustur } from "./belge-payload";
import {
  efaturamBelgeDurumuBekle,
  efaturamPdfIndir,
  type EfaturamBelgeTuru,
} from "./belge-indir";
import { efaturamApiJson } from "./client";
import {
  efaturaMukellefiSorgula,
  faturaBelgeTipiBelirle,
  type FaturaBelgeTipi,
} from "./mukellef";
import { efaturamOturumAl } from "./session";
import { trendyolEfaturamYapilandirildi } from "./config";

export type TrendyolFaturaOlusturSonuc =
  | {
      ok: true;
      belgeTipi: FaturaBelgeTipi;
      invoiceUuid: string;
      invoiceId?: string;
      pdf: Buffer;
    }
  | { ok: false; hata: string; yapilandirildi?: boolean };

type OlusturmaYanit = {
  invoiceUuid?: string;
  invoiceId?: string;
};

/** Ödeme için Trendyol E-Faturam üzerinden e-fatura veya e-arşiv oluşturur ve PDF indirir. */
export async function trendyolOdemeFaturaOlustur(
  odeme: KrediOdeme
): Promise<TrendyolFaturaOlusturSonuc> {
  if (!trendyolEfaturamYapilandirildi()) {
    return {
      ok: false,
      yapilandirildi: false,
      hata: "Trendyol E-Faturam yapılandırılmamış.",
    };
  }

  if (odeme.kurumsal) {
    if (!odeme.vergiNo?.trim() || !odeme.sirketUnvan?.trim()) {
      return { ok: false, hata: "Kurumsal fatura için vergi no ve şirket ünvanı gerekli." };
    }
  }

  try {
    let belgeTipi: FaturaBelgeTipi = "e-arsiv";
    let targetAlias: string | undefined;

    if (odeme.kurumsal) {
      const mukellefSonuc = await efaturaMukellefiSorgula(odeme.vergiNo!);
      if (!mukellefSonuc.ok) {
        return {
          ok: false,
          yapilandirildi: mukellefSonuc.yapilandirildi,
          hata: mukellefSonuc.hata,
        };
      }

      belgeTipi = faturaBelgeTipiBelirle({
        kurumsal: true,
        mukellef: mukellefSonuc.mukellef,
      });
      targetAlias = mukellefSonuc.alias;
    }

    const oturum = await efaturamOturumAl();
    const payload = kurumsalFaturaPayloadOlustur({
      odeme,
      companyId: oturum.companyId,
      userId: oturum.userId,
      belgeTipi,
      targetAlias,
    });

    const yol =
      belgeTipi === "e-fatura"
        ? "/api/invoice/documents/outgoing-einvoice"
        : "/api/invoice/documents/earchive";

    const olustur = await efaturamApiJson<OlusturmaYanit>(yol, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const invoiceUuid = olustur.invoiceUuid;
    if (!invoiceUuid) {
      return { ok: false, hata: "Trendyol fatura yanıtında invoiceUuid yok." };
    }

    await efaturamBelgeDurumuBekle({ belgeTipi, invoiceUuid });

    const documentType: EfaturamBelgeTuru =
      belgeTipi === "e-fatura" ? "EINVOICE" : "EARCHIVE";
    const pdf = await efaturamPdfIndir({
      documentType,
      documentUuid: invoiceUuid,
      companyId: oturum.companyId,
    });

    return {
      ok: true,
      belgeTipi,
      invoiceUuid,
      invoiceId: olustur.invoiceId,
      pdf,
    };
  } catch (e) {
    return {
      ok: false,
      yapilandirildi: true,
      hata: e instanceof Error ? e.message : "Trendyol fatura oluşturulamadı.",
    };
  }
}

/** @deprecated trendyolOdemeFaturaOlustur kullanın */
export const trendyolKurumsalFaturaOlustur = trendyolOdemeFaturaOlustur;
