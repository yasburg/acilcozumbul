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
  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");
  const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  const targetDir = path.join(baseDir, bucket);
  const fullPath = path.join(targetDir, filePath);
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
  try {
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const fullPath = path.join(baseDir, bucket, filePath);
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
  try {
    const { unlink } = await import("fs/promises");
    const path = await import("path");
    const baseDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const fullPath = path.join(baseDir, bucket, filePath);
    await unlink(fullPath);
    return true;
  } catch {
    return false;
  }
}
