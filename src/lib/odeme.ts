import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { BekleyenOdeme } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = "odeme-bekleyen.json";

async function readOdemeler(): Promise<BekleyenOdeme[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, FILE), "utf-8");
    return JSON.parse(raw) as BekleyenOdeme[];
  } catch {
    return [];
  }
}

async function writeOdemeler(list: BekleyenOdeme[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, FILE),
    JSON.stringify(list, null, 2),
    "utf-8"
  );
}

export async function olusturBekleyenOdeme(
  cekiciId: string,
  miktar: number
): Promise<BekleyenOdeme> {
  const list = await readOdemeler();
  const odeme: BekleyenOdeme = {
    id: randomUUID(),
    cekiciId,
    miktar,
    tutar: miktar * 50,
    olusturulma: new Date().toISOString(),
    durum: "bekliyor",
  };
  list.push(odeme);
  await writeOdemeler(list);
  return odeme;
}

export async function getBekleyenOdeme(
  id: string
): Promise<BekleyenOdeme | undefined> {
  const list = await readOdemeler();
  return list.find((o) => o.id === id && o.durum === "bekliyor");
}

export async function tamamlaOdeme(id: string): Promise<BekleyenOdeme | undefined> {
  const list = await readOdemeler();
  const index = list.findIndex((o) => o.id === id);
  if (index < 0) return undefined;
  list[index].durum = "tamamlandi";
  await writeOdemeler(list);
  return list[index];
}
