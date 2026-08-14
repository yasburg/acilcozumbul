import { randomUUID } from "crypto";
import { uploadFile } from "./file-storage";

const BUCKET = "cekici-belgeler";
const MAX_BYTES = 8 * 1024 * 1024;

const IZINLI_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function belgeBase64Ayikla(girdi: string): {
  mime: string;
  buffer: Buffer;
} | null {
  const trimmed = girdi.trim();
  if (!trimmed) return null;

  const dataUrl = trimmed.match(
    /^data:((?:image\/(?:jpeg|png|webp)|application\/pdf));base64,(.+)$/i
  );
  if (dataUrl) {
    const mime = dataUrl[1].toLowerCase();
    if (!IZINLI_MIME.has(mime)) return null;
    const buffer = Buffer.from(dataUrl[2], "base64");
    if (buffer.length > MAX_BYTES || buffer.length < 32) return null;
    return { mime, buffer };
  }

  try {
    const buffer = Buffer.from(trimmed, "base64");
    if (buffer.length < 32 || buffer.length > MAX_BYTES) return null;
    return { mime: "image/jpeg", buffer };
  } catch {
    return null;
  }
}

function uzanti(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("pdf")) return "pdf";
  return "jpg";
}

export async function cekiciBelgeYukle(
  cekiciId: string,
  tur: "ruhsat" | "cekici",
  base64: string
): Promise<string | null> {
  const parsed = belgeBase64Ayikla(base64);
  if (!parsed) return null;

  const ext = uzanti(parsed.mime);
  const path = `${cekiciId}/${tur}-${randomUUID()}.${ext}`;

  try {
    const publicUrl = await uploadFile(BUCKET, path, parsed.buffer);
    return publicUrl;
  } catch (error: any) {
    console.error("[cekici-belge]", error.message);
    return null;
  }
}
