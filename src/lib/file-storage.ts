export async function ensureUploadDir(subDir: string = ""): Promise<string> {
  if (typeof window !== "undefined") return "";
  const { mkdir } = await import("fs/promises");
  const path = await import("path");
  const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  const dirPath = path.join(baseDir, subDir);
  await mkdir(dirPath, { recursive: true });
  return dirPath;
}

export async function uploadFile(
  bucket: string,
  filePath: string,
  buffer: Buffer
): Promise<string> {
  if (typeof window !== "undefined") return "";
  if (!guvenliRelatif(bucket) || !guvenliRelatif(filePath)) {
    throw new Error("Geçersiz dosya yolu.");
  }
  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");
  const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  const targetDir = path.join(baseDir, bucket);
  const fullPath = path.join(targetDir, filePath);
  const kok = path.resolve(targetDir);
  const hedef = path.resolve(fullPath);
  if (hedef !== kok && !hedef.startsWith(kok + path.sep)) {
    throw new Error("Geçersiz dosya yolu.");
  }
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return `${baseUrl}/api/uploads/${bucket}/${filePath}`;
}

export async function getFile(
  bucket: string,
  filePath: string
): Promise<Buffer | null> {
  if (typeof window !== "undefined") return null;
  if (!guvenliRelatif(bucket) || !guvenliRelatif(filePath)) return null;
  try {
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const fullPath = path.join(baseDir, bucket, filePath);
    const kok = path.resolve(path.join(baseDir, bucket));
    const hedef = path.resolve(fullPath);
    if (hedef !== kok && !hedef.startsWith(kok + path.sep)) return null;
    return await readFile(fullPath);
  } catch {
    return null;
  }
}

export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<boolean> {
  if (typeof window !== "undefined") return false;
  if (!guvenliRelatif(bucket) || !guvenliRelatif(filePath)) return false;
  try {
    const { unlink } = await import("fs/promises");
    const path = await import("path");
    const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const fullPath = path.join(baseDir, bucket, filePath);
    const kok = path.resolve(path.join(baseDir, bucket));
    const hedef = path.resolve(fullPath);
    if (hedef !== kok && !hedef.startsWith(kok + path.sep)) return false;
    await unlink(fullPath);
    return true;
  } catch {
    return false;
  }
}

function guvenliRelatif(parca: string): boolean {
  return Boolean(
    parca &&
      !parca.includes("\0") &&
      !parca.split(/[/\\]/).some((p) => p === "..")
  );
}

/** Bucket altındaki klasörü (çekici id vb.) siler. */
export async function deletePrefix(
  bucket: string,
  prefix: string
): Promise<void> {
  if (typeof window !== "undefined") return;
  if (!guvenliRelatif(bucket) || !guvenliRelatif(prefix)) return;
  const { rm } = await import("fs/promises");
  const path = await import("path");
  const kok = path.resolve(
    process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads")
  );
  const hedef = path.resolve(path.join(kok, bucket, prefix));
  if (hedef !== kok && !hedef.startsWith(kok + path.sep)) return;
  await rm(hedef, { recursive: true, force: true });
}
