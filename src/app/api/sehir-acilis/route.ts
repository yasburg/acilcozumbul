import { NextResponse } from "next/server";
import { getAcikIller } from "@/lib/cekici-sehir-acilis-db";

/** Kayıt / onay UI — kullanıma açık iller (auth gerekmez) */
export async function GET() {
  const acikIller = await getAcikIller();
  return NextResponse.json({ acikIller });
}
