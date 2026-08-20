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

/** UBL cac:Person — TCKN alıcıda name (ad) + surname (soyad) zorunlu */
export function kisiAdiniAyir(tamAd: string): {
  name: string;
  surname: string;
} {
  const parcalar = tamAd.trim().split(/\s+/).filter(Boolean);
  if (parcalar.length === 0) {
    return { name: "Musteri", surname: "Musteri" };
  }
  if (parcalar.length === 1) {
    const tek = parcalar[0]!.slice(0, 127);
    return { name: tek, surname: tek };
  }
  return {
    name: parcalar.slice(0, -1).join(" ").slice(0, 127),
    surname: parcalar[parcalar.length - 1]!.slice(0, 255),
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

/** Fatura tarihi = ödeme zamanı (geçmiş alımlar için bugünü değil ödemeyi kullan) */
export function faturaKesimTarihi(odeme: KrediOdeme, simdi = new Date()): Date {
  const ham = odeme.olusturulma?.trim();
  if (!ham) return simdi;
  const d = new Date(ham);
  if (Number.isNaN(d.getTime())) return simdi;
  // Gelecek tarih GİB’de sorun çıkarır
  if (d.getTime() > simdi.getTime()) return simdi;
  return d;
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
  const kesim = faturaKesimTarihi(odeme);
  const kesimIso = kesim.toISOString();
  const kesimGun = kesimIso.slice(0, 10);

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
      // Bireysel (TCKN): name=ad, surname=soyad (UBL Person). Kurumsal: name=ünvan.
      name: (kisi?.name ?? unvan).slice(0, 127),
      ...(kisi ? { surname: kisi.surname } : {}),
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
      orderDate: kesimGun,
    },
    issuedAt: kesimIso,
    paymentInfo: {
      purchaseUrl: `${YASAL_SIRKET.web}/cekici/faturalar`,
      paymentMeans: "CREDIT_CARD",
      paymentDate: kesimIso,
      paymentType: "KREDI_KARTI",
      instructionNote: odeme.odemeReferans
        ? `Ödeme ref: ${odeme.odemeReferans}`
        : undefined,
    },
    deliveryInfo: {
      carrierTaxId: YASAL_SIRKET.vergiNo,
      carrierName: YASAL_SIRKET.kisaUnvan,
      sentAt: kesimGun,
    },
  };

  if (cfg.prefix) payload.prefix = cfg.prefix;
  if (belgeTipi === "e-fatura" && targetAlias) {
    payload.targetAlias = targetAlias;
  }

  return payload;
}
