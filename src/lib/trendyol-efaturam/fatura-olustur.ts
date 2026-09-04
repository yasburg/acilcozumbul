import type { KrediOdeme } from "../types";
import { faturaLocalReferenceId, kurumsalFaturaPayloadOlustur } from "./belge-payload";
import {
  efaturamBelgeDurumuBekle,
  efaturamBelgeLocalRefIleBul,
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
  odeme: KrediOdeme,
  opts?: {
    forceYeni?: boolean;
    kesimTarihi?: Date;
  }
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

    // Önceki timeout sonrası Trendyol'da kalan faturayı tekrar kesmeden çek
    // İptal edilmişleri atla; yeniden oluşturmada hiç recovery yapma
    let invoiceUuid: string | undefined;
    let invoiceId: string | undefined;

    if (!opts?.forceYeni) {
      const localRefs = [
        faturaLocalReferenceId(odeme),
        odeme.id.slice(0, 127),
      ].filter((v, i, a) => a.indexOf(v) === i);

      for (const localReferenceId of localRefs) {
        const mevcut = await efaturamBelgeLocalRefIleBul({
          belgeTipi,
          companyId: oturum.companyId,
          localReferenceId,
          iptalleriAtla: true,
        });
        if (mevcut?.invoiceUuid) {
          invoiceUuid = mevcut.invoiceUuid;
          invoiceId = mevcut.invoiceId;
          break;
        }
      }
    }

    if (!invoiceUuid) {
      const payload = kurumsalFaturaPayloadOlustur({
        odeme,
        companyId: oturum.companyId,
        userId: oturum.userId,
        belgeTipi,
        targetAlias,
        kesimTarihi: opts?.kesimTarihi,
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

      invoiceUuid = olustur.invoiceUuid;
      invoiceId = olustur.invoiceId;
      if (!invoiceUuid) {
        return { ok: false, hata: "Trendyol fatura yanıtında invoiceUuid yok." };
      }
    }

    const durum = await efaturamBelgeDurumuBekle({ belgeTipi, invoiceUuid });

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
      invoiceId: invoiceId ?? durum.invoiceId,
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
