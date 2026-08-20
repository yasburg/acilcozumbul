import type { KrediOdeme } from "../types";
import { tcKimlikGecerliMi } from "../eposta";
import { faturaKdvAyir } from "../fatura-link";
import { YASAL_SIRKET } from "../yasal-sirket";
import type { FaturaBelgeTipi } from "./mukellef";
import { trendyolEfaturamConfigOku } from "./config";

export type KurumsalFaturaPayloadGirdi = {
  odeme: KrediOdeme;
  companyId: number;
  userId: number;
  belgeTipi: FaturaBelgeTipi;
  targetAlias?: string;
};

export function kurumsalOdemeAciklama(odeme: KrediOdeme): string {
  if (odeme.odemeTipi === "abonelik") {
    return `Acil Çözüm Bul abonelik — ${odeme.miktar} kredi (paket ${odeme.paketTl} TL)`;
  }
  return `Acil Çözüm Bul kredi paketi — ${odeme.miktar} kredi (paket ${odeme.paketTl} TL)`;
}

/** Bireysel e-arşivde TC yoksa GİB placeholder TCKN */
export const BIREYSEL_EARSIV_VARSAYILAN_TCKN = "11111111111";

export function bireyselEarsivTckn(odeme: KrediOdeme): string {
  const tc = (odeme.faturaTcKimlik ?? "").replace(/\D/g, "");
  if (tc && tcKimlikGecerliMi(tc)) return tc;
  return BIREYSEL_EARSIV_VARSAYILAN_TCKN;
}

/** UBL cac:Person — TCKN alıcıda FirstName + FamilyName zorunlu */
export function kisiAdiniAyir(tamAd: string): {
  firstName: string;
  familyName: string;
} {
  const parcalar = tamAd.trim().split(/\s+/).filter(Boolean);
  if (parcalar.length === 0) {
    return { firstName: "Musteri", familyName: "Musteri" };
  }
  if (parcalar.length === 1) {
    return { firstName: parcalar[0]!, familyName: parcalar[0]! };
  }
  return {
    firstName: parcalar.slice(0, -1).join(" ").slice(0, 127),
    familyName: parcalar[parcalar.length - 1]!.slice(0, 127),
  };
}

function tlKurus(tl: number): number {
  return Math.round(tl * 100);
}

function aliciKonum(adres?: string) {
  const metin = (adres ?? "").trim() || YASAL_SIRKET.adres;
  return {
    city: "İstanbul",
    district: "Bayrampaşa",
    address: metin.slice(0, 255),
  };
}

/** Trendyol createEArchive / createOutgoingEInvoice gövdesi */
export function kurumsalFaturaPayloadOlustur(
  girdi: KurumsalFaturaPayloadGirdi
): Record<string, unknown> {
  const { odeme, companyId, userId, belgeTipi, targetAlias } = girdi;
  const cfg = trendyolEfaturamConfigOku();
  const aciklama = kurumsalOdemeAciklama(odeme);
  const kdv = faturaKdvAyir(odeme.tutar);
  const matrahKurus = tlKurus(kdv.matrah);
  const kdvKurus = tlKurus(kdv.kdv);
  const toplamKurus = tlKurus(kdv.toplam);
  const konum = aliciKonum(odeme.faturaAdres);
  const vergiNo = odeme.kurumsal
    ? (odeme.vergiNo ?? "").replace(/\D/g, "")
    : bireyselEarsivTckn(odeme);
  const unvan = odeme.kurumsal
    ? (odeme.sirketUnvan ?? odeme.cekiciAd).trim()
    : odeme.cekiciAd.trim();
  const bireysel = !odeme.kurumsal || vergiNo.length === 11;
  const kisi = bireysel ? kisiAdiniAyir(unvan) : null;
  const simdi = new Date().toISOString();

  const invoiceLine = {
    unitCode: "C62",
    quantity: 1,
    unitPriceAmount: matrahKurus,
    taxableAmount: matrahKurus,
    taxAmount: kdvKurus,
    totalAmount: toplamKurus,
    taxPercent: Math.round(kdv.oran * 100),
    taxName: "KDV",
    taxCode: "0015",
    itemName: aciklama.slice(0, 255),
    totalDiscountAmount: 0,
    totalTax: {
      totalTaxAmount: kdvKurus,
      subTotalTaxes: [
        {
          taxableAmount: matrahKurus,
          taxAmount: kdvKurus,
          taxType: "KDV",
          percent: Math.round(kdv.oran * 100),
        },
      ],
    },
  };

  const payload: Record<string, unknown> = {
    autoInvoiceId: true,
    companyId,
    userId,
    localReferenceId: odeme.id.slice(0, 127),
    source: "WEB",
    notes: [aciklama],
    recipientInfo: {
      taxId: vergiNo,
      countryCode: "TR",
      city: konum.city,
      district: konum.district,
      address: konum.address,
      email: odeme.faturaEposta || undefined,
      phone: odeme.cekiciTelefon.replace(/\D/g, "").slice(-15) || undefined,
      name: unvan.slice(0, 127),
      ...(kisi
        ? {
            firstName: kisi.firstName,
            familyName: kisi.familyName,
          }
        : {}),
    },
    currencyInfo: { currency: "TRY" },
    invoiceInfo: {
      invoiceType: belgeTipi === "e-fatura" ? "TEMELFATURA" : "EARSIVFATURA",
      invoiceTypeCode: "SATIS",
    },
    invoiceLines: [invoiceLine],
    totalTax: invoiceLine.totalTax,
    invoiceTotal: {
      lineExtensionAmount: matrahKurus,
      taxExclusiveAmount: matrahKurus,
      taxInclusiveAmount: toplamKurus,
      payableAmount: toplamKurus,
      allowanceTotalAmount: 0,
    },
    orderInfo: {
      orderId: odeme.id.slice(0, 127),
      orderDate: simdi.slice(0, 10),
    },
    issuedAt: simdi,
    paymentInfo: {
      purchaseUrl: `${YASAL_SIRKET.web}/cekici/faturalar`,
      paymentMeans: "CREDIT_CARD",
      paymentDate: simdi,
      paymentType: "KREDI_KARTI",
      instructionNote: odeme.odemeReferans
        ? `Ödeme ref: ${odeme.odemeReferans}`
        : undefined,
    },
    deliveryInfo: {
      carrierTaxId: YASAL_SIRKET.vergiNo,
      carrierName: YASAL_SIRKET.kisaUnvan,
      sentAt: simdi.slice(0, 10),
    },
  };

  if (cfg.prefix) payload.prefix = cfg.prefix;
  if (belgeTipi === "e-fatura" && targetAlias) {
    payload.targetAlias = targetAlias;
  }

  return payload;
}
