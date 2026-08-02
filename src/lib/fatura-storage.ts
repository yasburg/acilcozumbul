import { getSupabaseAdmin } from "./supabase/admin";

export const FATURA_STORAGE_BUCKET = "faturalar";
export const FATURA_PDF_MAX_BYTES = 5 * 1024 * 1024;

/** Private path: {cekiciId}/{faturaId}.pdf */
export function faturaStoragePath(cekiciId: string, faturaId: string): string {
  return `${cekiciId}/${faturaId}.pdf`;
}

export function faturaPdfBufferGecerliMi(buf: Buffer): boolean {
  if (buf.length < 5 || buf.length > FATURA_PDF_MAX_BYTES) return false;
  return buf.subarray(0, 5).toString("ascii") === "%PDF-";
}

export async function faturaPdfYukle(
  storagePath: string,
  pdf: Uint8Array | Buffer
): Promise<void> {
  const body = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
  const { error } = await getSupabaseAdmin()
    .storage.from(FATURA_STORAGE_BUCKET)
    .upload(storagePath, body, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) {
    throw new Error(`Fatura PDF yüklenemedi: ${error.message}`);
  }
}

export async function faturaPdfIndir(
  storagePath: string
): Promise<Uint8Array | null> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(FATURA_STORAGE_BUCKET)
    .download(storagePath);
  if (error || !data) {
    if (error) {
      console.error("[fatura-storage] download", error.message);
    }
    return null;
  }
  const buf = Buffer.from(await data.arrayBuffer());
  return new Uint8Array(buf);
}
