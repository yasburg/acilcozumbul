import { efaturamApiFetch, efaturamApiJson } from "./client";

export type EfaturamBelgeTuru = "EARCHIVE" | "EINVOICE";

/** GİB’e raporlanmaya hazır veya raporlanmış — PDF indirilebilir */
const HAZIR_GIB_DURUMLARI = new Set([
  "REPORTED",
  "READY_TO_BE_REPORTED",
  "SUCCEED",
  "SUCCESS",
]);

const HATA_GIB_DURUMLARI = new Set([
  "FAILED",
  "FAIL",
  "REJECTED",
  "ERROR",
  "CANCELLED",
  "CANCELED",
]);

function bekle(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function durumKodu(deger: unknown): number | null {
  if (typeof deger === "number" && Number.isFinite(deger)) return deger;
  if (typeof deger === "string" && /^\d+$/.test(deger)) return Number(deger);
  return null;
}

export function efaturamBelgeHazirMi(durum: {
  status?: number | string;
  gibStatus?: string;
}): boolean {
  const gib = (durum.gibStatus ?? "").toUpperCase();
  if (HAZIR_GIB_DURUMLARI.has(gib)) return true;
  const kod = durumKodu(durum.status);
  // 10: tamamlandı (doküman örneği), 205: READY_TO_BE_REPORTED
  return kod === 10 || kod === 205;
}

export function efaturamBelgeHataliMi(durum: {
  gibStatus?: string;
  status?: number | string;
}): boolean {
  const gib = (durum.gibStatus ?? "").toUpperCase();
  if (HATA_GIB_DURUMLARI.has(gib)) return true;
  const kod = durumKodu(durum.status);
  return kod === 40 || kod === 50;
}

export async function efaturamBelgeDurumuBekle(opts: {
  belgeTipi: "e-fatura" | "e-arsiv";
  invoiceUuid: string;
  maxDeneme?: number;
  aralikMs?: number;
}): Promise<{ status?: number | string; gibStatus?: string; invoiceId?: string }> {
  const max = opts.maxDeneme ?? 30;
  const aralik = opts.aralikMs ?? 2000;
  const yol =
    opts.belgeTipi === "e-fatura"
      ? `/api/invoice/documents/outgoing-einvoice/status/${encodeURIComponent(opts.invoiceUuid)}`
      : `/api/invoice/documents/earchive/status/${encodeURIComponent(opts.invoiceUuid)}`;

  let sonDurum: {
    status?: number | string;
    gibStatus?: string;
    invoiceId?: string;
  } = {};

  for (let i = 0; i < max; i++) {
    sonDurum = await efaturamApiJson<{
      status?: number | string;
      gibStatus?: string;
      invoiceUuid?: string;
      invoiceId?: string;
    }>(yol, { method: "GET" });

    if (efaturamBelgeHataliMi(sonDurum)) {
      throw new Error(
        `Trendyol fatura başarısız (${opts.invoiceUuid}): gibStatus=${sonDurum.gibStatus ?? "—"} status=${String(sonDurum.status ?? "—")}`
      );
    }
    if (efaturamBelgeHazirMi(sonDurum)) {
      return sonDurum;
    }
    await bekle(aralik);
  }

  throw new Error(
    `Trendyol fatura durumu zaman aşımı (${opts.invoiceUuid}). Son: gibStatus=${sonDurum.gibStatus ?? "—"} status=${String(sonDurum.status ?? "—")}`
  );
}

export type EfaturamBelgeOzet = {
  invoiceUuid: string;
  invoiceId?: string;
  gibStatus?: string;
  status?: number | string;
};

/** Önceki (yarım kalan) kesimi localReferenceId ile bul — duplicate önler */
export async function efaturamBelgeLocalRefIleBul(opts: {
  belgeTipi: "e-fatura" | "e-arsiv";
  companyId: number;
  localReferenceId: string;
}): Promise<EfaturamBelgeOzet | null> {
  const yol =
    opts.belgeTipi === "e-fatura"
      ? "/api/invoice/documents/outgoing-einvoice/search"
      : "/api/invoice/documents/earchive/search";

  try {
    const yanit = await efaturamApiJson<{
      content?: Array<{
        invoiceUuid?: string;
        invoiceId?: string;
        gibStatus?: string;
        status?: number | string;
      }>;
    }>(yol, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: opts.companyId,
        localReferenceId: opts.localReferenceId.slice(0, 127),
        page: 0,
        size: 5,
      }),
    });

    const ilk = yanit.content?.find((k) => k.invoiceUuid);
    if (!ilk?.invoiceUuid) return null;
    return {
      invoiceUuid: ilk.invoiceUuid,
      invoiceId: ilk.invoiceId,
      gibStatus: ilk.gibStatus,
      status: ilk.status,
    };
  } catch {
    return null;
  }
}

export async function efaturamPdfIndir(opts: {
  documentType: EfaturamBelgeTuru;
  documentUuid: string;
  companyId: number;
}): Promise<Buffer> {
  const res = await efaturamApiFetch(
    "/api/invoice/documents/download/permanent-url",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
      body: JSON.stringify({
        documentType: opts.documentType,
        fileExtension: "pdf",
        documentUuid: opts.documentUuid,
        companyId: opts.companyId,
      }),
    }
  );

  const indirmeUrl = (await res.text()).trim().replace(/^"|"$/g, "");
  if (!res.ok || !indirmeUrl.startsWith("http")) {
    throw new Error(
      `Trendyol PDF indirme linki alınamadı (${res.status})${indirmeUrl ? `: ${indirmeUrl.slice(0, 120)}` : ""}`
    );
  }

  const pdfRes = await fetch(indirmeUrl);
  if (!pdfRes.ok) {
    throw new Error(`Trendyol PDF indirilemedi (${pdfRes.status}).`);
  }
  const buf = Buffer.from(await pdfRes.arrayBuffer());
  if (buf.length < 100) {
    throw new Error("Trendyol PDF dosyası boş veya geçersiz.");
  }
  return buf;
}
