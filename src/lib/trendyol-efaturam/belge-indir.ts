import { efaturamApiFetch, efaturamApiJson } from "./client";

export type EfaturamBelgeTuru = "EARCHIVE" | "EINVOICE";

function bekle(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function efaturamBelgeDurumuBekle(opts: {
  belgeTipi: "e-fatura" | "e-arsiv";
  invoiceUuid: string;
  maxDeneme?: number;
  aralikMs?: number;
}): Promise<void> {
  const max = opts.maxDeneme ?? 20;
  const aralik = opts.aralikMs ?? 2000;
  const yol =
    opts.belgeTipi === "e-fatura"
      ? `/api/invoice/documents/outgoing-einvoice/status/${encodeURIComponent(opts.invoiceUuid)}`
      : `/api/invoice/documents/earchive/status/${encodeURIComponent(opts.invoiceUuid)}`;

  for (let i = 0; i < max; i++) {
    const durum = await efaturamApiJson<{
      status?: number;
      gibStatus?: string;
      invoiceUuid?: string;
    }>(yol, { method: "GET" });

    if (durum.gibStatus === "REPORTED" || durum.status === 10) {
      return;
    }
    await bekle(aralik);
  }

  throw new Error(
    `Trendyol fatura durumu zaman aşımı (${opts.invoiceUuid}). Son deneme yapıldı.`
  );
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
