import { promises as fs } from "fs";
import path from "path";
import type { Cekici, Talep, SmsKaydi } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCekiciler(): Promise<Cekici[]> {
  return readJson<Cekici[]>("cekiciler.json", []);
}

export async function saveCekiciler(cekiciler: Cekici[]): Promise<void> {
  await writeJson("cekiciler.json", cekiciler);
}

export async function getCekiciById(id: string): Promise<Cekici | undefined> {
  const cekiciler = await getCekiciler();
  return cekiciler.find((c) => c.id === id);
}

export async function getCekiciByToken(token: string): Promise<Cekici | undefined> {
  const cekiciler = await getCekiciler();
  return cekiciler.find((c) => c.token === token);
}

export async function getCekiciByTelefon(
  telefon: string
): Promise<Cekici | undefined> {
  const norm = telefon.replace(/\D/g, "");
  const cekiciler = await getCekiciler();
  return cekiciler.find(
    (c) => c.telefon.replace(/\D/g, "") === norm
  );
}

export async function addCekici(cekici: Cekici): Promise<void> {
  const cekiciler = await getCekiciler();
  cekiciler.push(cekici);
  await saveCekiciler(cekiciler);
}

export async function updateCekici(cekici: Cekici): Promise<void> {
  const cekiciler = await getCekiciler();
  const index = cekiciler.findIndex((c) => c.id === cekici.id);
  if (index >= 0) {
    cekiciler[index] = cekici;
    await saveCekiciler(cekiciler);
  }
}

export async function getTalepler(): Promise<Talep[]> {
  return readJson<Talep[]>("talepler.json", []);
}

export async function saveTalepler(talepler: Talep[]): Promise<void> {
  await writeJson("talepler.json", talepler);
}

export async function getTalepById(id: string): Promise<Talep | undefined> {
  const talepler = await getTalepler();
  return talepler.find((t) => t.id === id);
}

export async function addTalep(talep: Talep): Promise<void> {
  const talepler = await getTalepler();
  talepler.push(talep);
  await saveTalepler(talepler);
}

export async function updateTalep(talep: Talep): Promise<void> {
  const talepler = await getTalepler();
  const index = talepler.findIndex((t) => t.id === talep.id);
  if (index >= 0) {
    talepler[index] = talep;
    await saveTalepler(talepler);
  }
}

export async function getSmsLog(): Promise<SmsKaydi[]> {
  return readJson<SmsKaydi[]>("sms-log.json", []);
}

export async function addSmsKaydi(kayit: SmsKaydi): Promise<void> {
  const log = await getSmsLog();
  log.unshift(kayit);
  await writeJson("sms-log.json", log);
}
