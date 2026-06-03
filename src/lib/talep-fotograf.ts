import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "./supabase/admin";

const BUCKET = "talep-fotograflari";
const MAX_BYTES = 4 * 1024 * 1024;

/** data:image/jpeg;base64,... veya ham base64 */
export function fotografBase64Ayikla(girdi: string): {
  mime: string;
  buffer: Buffer;
} | null {
  const trimmed = girdi.trim();
  if (!trimmed) return null;

  const dataUrl = trimmed.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);
  if (dataUrl) {
    const buffer = Buffer.from(dataUrl[2], "base64");
    if (buffer.length > MAX_BYTES) return null;
    return { mime: dataUrl[1].toLowerCase(), buffer };
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
  return "jpg";
}

/** Talep fotoğrafını Supabase Storage'a yükler; public URL döner */
export async function talepFotografYukle(
  talepId: string,
  base64: string
): Promise<string | null> {
  const parsed = fotografBase64Ayikla(base64);
  if (!parsed) return null;

  const ext = uzanti(parsed.mime);
  const path = `${talepId}/${randomUUID()}.${ext}`;

  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, parsed.buffer, {
      contentType: parsed.mime,
      upsert: false,
    });

  if (error) {
    console.error("[talep-fotograf]", error.message);
    return null;
  }

  const { data } = getSupabaseAdmin().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}
