import { randomUUID } from "crypto";
import { uploadFile } from "./file-storage";
import type { Cekici, ProfilFotoDurum } from "./types";

const BUCKET = "cekici-profil-fotograflari";
const MAX_BYTES = 5 * 1024 * 1024;

const IZINLI_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Panel red şablonları */
export const PROFIL_FOTO_RED_SABLONLARI = [
  "Profil fotoğrafı yalnızca yüzünüzü göstermelidir; arka plan sade olmalıdır.",
  "Fotoğraf net değil veya çok karanlık; daha net bir çekim yükleyin.",
  "Fotoğrafta başka kişiler veya plaka/belge görünüyor; yalnızca sizin yüzünüz olmalı.",
  "Uygunsuz veya platform kurallarına aykırı görüntü.",
] as const;

export function profilFotoBase64Ayikla(girdi: string): {
  mime: string;
  buffer: Buffer;
} | null {
  const trimmed = girdi.trim();
  if (!trimmed) return null;

  const dataUrl = trimmed.match(
    /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i
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
  return "jpg";
}

export async function cekiciProfilFotoYukle(
  cekiciId: string,
  base64: string
): Promise<string | null> {
  const parsed = profilFotoBase64Ayikla(base64);
  if (!parsed) return null;

  const ext = uzanti(parsed.mime);
  const path = `${cekiciId}/profil-${randomUUID()}.${ext}`;

  try {
    const publicUrl = await uploadFile(BUCKET, path, parsed.buffer);
    return publicUrl;
  } catch (error: any) {
    console.error("[cekici-profil-foto]", error.message);
    return null;
  }
}

/** Müşteriye yalnızca onaylı fotoğraf URL’si */
export function onayliProfilFotoUrl(
  c: Pick<Cekici, "profilFotoUrl" | "profilFotoDurum"> | null | undefined
): string | null {
  if (!c) return null;
  if (c.profilFotoDurum !== "onaylandi") return null;
  const url = c.profilFotoUrl?.trim();
  return url || null;
}

export function profilFotoDurumEtiket(d: ProfilFotoDurum): string | null {
  switch (d) {
    case "beklemede":
      return "İnceleniyor";
    case "onaylandi":
      return "Onaylandı";
    case "reddedildi":
      return "Onaylanmadı";
    default:
      return null;
  }
}
