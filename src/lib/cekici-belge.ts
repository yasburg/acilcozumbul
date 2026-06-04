import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "./supabase/admin";

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

  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, parsed.buffer, {
      contentType: parsed.mime,
      upsert: true,
    });

  if (error) {
    console.error("[cekici-belge]", error.message);
    return null;
  }

  const { data } = getSupabaseAdmin().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl || null;
}
