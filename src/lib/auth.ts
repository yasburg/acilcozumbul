import { cookies } from "next/headers";
import { getCekiciByToken } from "./db";
import type { Cekici } from "./types";

export const CEKICI_COOKIE = "cekici_token";

export async function getCurrentCekici(): Promise<Cekici | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CEKICI_COOKIE)?.value;
  if (!token) return null;
  const cekici = await getCekiciByToken(token);
  return cekici ?? null;
}
