import { deleteFile, getFile, uploadFile } from "./file-storage";

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
  await uploadFile(FATURA_STORAGE_BUCKET, storagePath, body);
}

export async function faturaPdfIndir(
  storagePath: string
): Promise<Uint8Array | null> {
  const buf = await getFile(FATURA_STORAGE_BUCKET, storagePath);
  if (!buf) return null;
  return new Uint8Array(buf);
}

export async function faturaPdfSil(storagePath: string): Promise<void> {
  await deleteFile(FATURA_STORAGE_BUCKET, storagePath);
}
